"""Coordinator for Smart Charger."""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
)
from homeassistant.util import dt as dt_util

from .const import (
    CONF_BATTERY_LEVEL,
    CONF_BATTERY_STATE,
    CONF_CHARGER_TYPE,
    CONF_EXCLUSIVE_SWITCH,
    CONF_IS_WATCH,
    CONF_MAX_CHARGE,
    CONF_MIN_CHARGE,
    CONF_NAME,
    CONF_POWER,
    CONF_SWITCH,
    DEFAULT_MAX_PHONE,
    DEFAULT_MAX_WATCH,
    DEFAULT_MIN_PHONE,
    DEFAULT_MIN_WATCH,
    IDENTIFICATION_DELAY,
    POWER_DROPPED_THRESHOLD,
    POWER_FRESHNESS_WINDOW,
    POWER_IDLE_THRESHOLD,
    POWER_JUMP_THRESHOLD,
    PROBE_COOLDOWN_MINUTES,
    PROBE_SLEEP_MINUTES,
    PROBE_TEST_DURATION,
    SAFETY_TIMEOUT_HOURS,
    STATE_CHARGING,
    STATE_COOLDOWN,
    STATE_GENERIC,
    STATE_IDLE,
    STATE_MANUAL_100,
    STATE_SLEEP,
)

_LOGGER = logging.getLogger(__name__)


class ChargerDevice:
    """Configured smart device for charging."""

    def __init__(self, data: dict[str, Any]) -> None:
        self.name: str = data[CONF_NAME]
        self.battery_level_entity: str = data[CONF_BATTERY_LEVEL]
        self.battery_state_entity: str = data[CONF_BATTERY_STATE]
        self.charger_type_entity: str = data[CONF_CHARGER_TYPE]
        self.is_watch: bool = data.get(CONF_IS_WATCH, False)
        self.exclusive_switch: str | None = data.get(CONF_EXCLUSIVE_SWITCH)
        self.min_charge: float = float(
            data.get(CONF_MIN_CHARGE, DEFAULT_MIN_WATCH if self.is_watch else DEFAULT_MIN_PHONE)
        )
        self.max_charge: float = float(
            data.get(CONF_MAX_CHARGE, DEFAULT_MAX_WATCH if self.is_watch else DEFAULT_MAX_PHONE)
        )


class SmartChargerSocket:
    """Manages an individual smart socket charger."""

    def __init__(
        self,
        hass: HomeAssistant,
        charger_id: str,
        name: str,
        switch_entity: str,
        power_entity: str,
        devices: list[ChargerDevice],
        update_callback: CALLBACK_TYPE,
    ) -> None:
        self.hass = hass
        self.charger_id = charger_id
        self.name = name
        self.switch_entity = switch_entity
        self.power_entity = power_entity
        self.devices = devices
        self._update_callback = update_callback

        # State
        self.state: str = STATE_IDLE
        self.active_device: ChargerDevice | None = None
        self.sleeping_device: ChargerDevice | None = None
        self.current_power: float = 0.0

        # Timers / cancel callbacks
        self._unsub_listeners: list[CALLBACK_TYPE] = []
        self._unsub_timer: CALLBACK_TYPE | None = None
        self._power_drop_cancel: CALLBACK_TYPE | None = None
        self._is_probing: bool = False

    async def async_setup(self) -> None:
        """Set up event listeners."""
        # Listen to switch state
        self._unsub_listeners.append(
            async_track_state_change_event(
                self.hass, [self.switch_entity], self._handle_switch_change
            )
        )

        # Listen to power sensor
        self._unsub_listeners.append(
            async_track_state_change_event(
                self.hass, [self.power_entity], self._handle_power_change
            )
        )

        # Listen to device battery levels
        battery_entities = [d.battery_level_entity for d in self.devices]
        if battery_entities:
            self._unsub_listeners.append(
                async_track_state_change_event(
                    self.hass, battery_entities, self._handle_battery_change
                )
            )

        # Initial power read
        power_state = self.hass.states.get(self.power_entity)
        if power_state and power_state.state not in ("unknown", "unavailable"):
            try:
                self.current_power = float(power_state.state)
            except ValueError:
                self.current_power = 0.0

    def async_unload(self) -> None:
        """Cancel all listeners and timers."""
        for unsub in self._unsub_listeners:
            unsub()
        self._unsub_listeners.clear()
        if self._unsub_timer:
            self._unsub_timer()
            self._unsub_timer = None
        if self._power_drop_cancel:
            self._power_drop_cancel()
            self._power_drop_cancel = None

    @callback
    def _notify(self) -> None:
        """Notify state update to entities."""
        if self._update_callback:
            self._update_callback()

    async def _handle_switch_change(self, event: Event) -> None:
        """Handle physical or manual switch toggles."""
        new_state = event.data.get("new_state")
        old_state = event.data.get("old_state")
        if not new_state or not old_state or new_state.state == old_state.state:
            return

        # If turned ON manually (outside our probe)
        if new_state.state == "on" and not self._is_probing:
            context = new_state.context
            # Manual trigger has parent_id == None
            if context and context.parent_id is None:
                _LOGGER.info("Charger %s turned on manually -> manual_100 mode", self.name)
                self.state = STATE_MANUAL_100
                self._schedule_safety_timeout()
                self._notify()

    async def _handle_power_change(self, event: Event) -> None:
        """Handle power sensor updates."""
        new_state = event.data.get("new_state")
        if not new_state or new_state.state in ("unknown", "unavailable"):
            return

        try:
            power = float(new_state.state)
        except ValueError:
            return

        old_power = self.current_power
        self.current_power = power

        # 1. Power Jump detection (> 2.5W) when idle
        if (
            self.state in (STATE_IDLE, "")
            and old_power < POWER_JUMP_THRESHOLD
            and power >= POWER_JUMP_THRESHOLD
            and not self._is_probing
        ):
            _LOGGER.info(
                "Power jump detected on %s (%.1fW) -> scheduling device identification",
                self.name,
                power,
            )
            if self._unsub_timer:
                self._unsub_timer()
            self._unsub_timer = async_call_later(
                self.hass, IDENTIFICATION_DELAY, self._async_identify_connected_device
            )

        # 2. Power drop detection (< 0.8W) while active
        if power < POWER_DROPPED_THRESHOLD and self.state in (
            STATE_CHARGING,
            STATE_GENERIC,
            STATE_MANUAL_100,
        ):
            if not self._power_drop_cancel:
                self._power_drop_cancel = async_call_later(
                    self.hass, 20, self._async_confirm_unplugged
                )
        elif power >= POWER_DROPPED_THRESHOLD and self._power_drop_cancel:
            self._power_drop_cancel()
            self._power_drop_cancel = None

        self._notify()

    async def _async_identify_connected_device(self, *_: Any) -> None:
        """Identify which device just connected based on charging state and freshness."""
        self._unsub_timer = None
        # Guard: switch must be ON and power must still be drawn
        switch_state = self.hass.states.get(self.switch_entity)
        if not switch_state or switch_state.state != "on":
            return
        if self.current_power <= POWER_IDLE_THRESHOLD:
            return

        now = dt_util.utcnow()
        matched_dev: ChargerDevice | None = None

        for dev in self.devices:
            # Check exclusive switch (e.g. dedicated watch cradle must be off)
            if dev.exclusive_switch:
                ex_state = self.hass.states.get(dev.exclusive_switch)
                if ex_state and ex_state.state == "on":
                    continue

            # Check battery and charger states
            bs_state = self.hass.states.get(dev.battery_state_entity)
            ct_state = self.hass.states.get(dev.charger_type_entity)

            is_charging = False
            if bs_state and bs_state.state in ("charging", "full"):
                is_charging = True
            elif ct_state and ct_state.state in ("ac", "usb", "wireless", "dock"):
                is_charging = True

            if not is_charging:
                continue

            # Check freshness (< 120s)
            age_bs = (
                (now - bs_state.last_changed).total_seconds()
                if bs_state
                else 9999
            )
            age_ct = (
                (now - ct_state.last_changed).total_seconds()
                if ct_state
                else 9999
            )
            min_age = min(age_bs, age_ct)

            if min_age < POWER_FRESHNESS_WINDOW:
                matched_dev = dev
                break

        if matched_dev:
            # Get current battery level
            lvl_state = self.hass.states.get(matched_dev.battery_level_entity)
            current_lvl = float(lvl_state.state) if lvl_state and lvl_state.state.replace('.', '', 1).isdigit() else 0.0

            if current_lvl >= matched_dev.max_charge:
                _LOGGER.info(
                    "Device %s connected to %s already at %.0f%% (>= max %.0f%%) -> manual 100",
                    matched_dev.name,
                    self.name,
                    current_lvl,
                    matched_dev.max_charge,
                )
                self.state = STATE_MANUAL_100
                self.active_device = matched_dev
                self._schedule_safety_timeout()
            else:
                _LOGGER.info(
                    "Device %s identified on %s (%.0f%%) -> start charging to %.0f%%",
                    matched_dev.name,
                    self.name,
                    current_lvl,
                    matched_dev.max_charge,
                )
                self.state = STATE_CHARGING
                self.active_device = matched_dev
        else:
            _LOGGER.info(
                "No smart device matched on %s (%.1fW) -> generic device mode",
                self.name,
                self.current_power,
            )
            self.state = STATE_GENERIC
            self.active_device = None

        self._notify()

    async def _handle_battery_change(self, event: Event) -> None:
        """Handle battery level changes for target cutoff and hysteresis restart."""
        entity_id = event.data.get("entity_id")
        new_state = event.data.get("new_state")
        if not new_state or not new_state.state.replace('.', '', 1).isdigit():
            return

        level = float(new_state.state)

        # 1. While charging: cutoff when >= max_charge
        if self.state == STATE_CHARGING and self.active_device:
            if entity_id == self.active_device.battery_level_entity:
                if level >= self.active_device.max_charge:
                    _LOGGER.info(
                        "Target charge reached on %s for %s (%.0f%% >= %.0f%%) -> stopping",
                        self.name,
                        self.active_device.name,
                        level,
                        self.active_device.max_charge,
                    )
                    self.sleeping_device = self.active_device
                    self.active_device = None
                    self.state = STATE_COOLDOWN
                    await self._turn_switch(False)
                    self._schedule_probe(PROBE_COOLDOWN_MINUTES)
                    self._notify()

        # 2. While cooldown or sleep: hysteresis restart when < min_charge
        elif self.state in (STATE_COOLDOWN, STATE_SLEEP) and self.sleeping_device:
            if entity_id == self.sleeping_device.battery_level_entity:
                if level < self.sleeping_device.min_charge:
                    _LOGGER.info(
                        "Battery dropped below min on %s for %s (%.0f%% < %.0f%%) -> restarting",
                        self.name,
                        self.sleeping_device.name,
                        level,
                        self.sleeping_device.min_charge,
                    )
                    await self._turn_switch(True)
                    # Check after 10s if device is actually plugged in
                    async_call_later(self.hass, 10, self._async_verify_hysteresis_plugged)

    async def _async_verify_hysteresis_plugged(self, *_: Any) -> None:
        """Verify if device is physically plugged in after hysteresis switch-on."""
        if self.current_power > POWER_IDLE_THRESHOLD:
            self.active_device = self.sleeping_device
            self.sleeping_device = None
            self.state = STATE_CHARGING
            _LOGGER.info("Hysteresis verified on %s -> charging active", self.name)
        else:
            _LOGGER.info("Hysteresis check failed on %s (0W) -> device was moved", self.name)
            self.state = STATE_IDLE
            self.active_device = None
            self.sleeping_device = None
        self._notify()

    def _schedule_probe(self, minutes: int) -> None:
        """Schedule a probe test."""
        if self._unsub_timer:
            self._unsub_timer()
        self._unsub_timer = async_call_later(
            self.hass, minutes * 60, self._async_run_probe
        )

    async def _async_run_probe(self, *_: Any) -> None:
        """Run 12-second probe test to check if device is still connected."""
        self._unsub_timer = None
        if self.state not in (STATE_COOLDOWN, STATE_SLEEP):
            return

        _LOGGER.info("Running probe test on %s...", self.name)
        self._is_probing = True
        await self._turn_switch(True)

        async_call_later(self.hass, PROBE_TEST_DURATION, self._async_finish_probe)

    async def _async_finish_probe(self, *_: Any) -> None:
        """Finish probe test and evaluate power draw."""
        self._is_probing = False
        # Guard: if user manually forced 100% or toggled during probe, abort
        if self.state not in (STATE_COOLDOWN, STATE_SLEEP):
            return

        # Case 1: Power <= 1.5W -> cable is empty!
        if self.current_power <= POWER_IDLE_THRESHOLD:
            _LOGGER.info("Probe on %s: cable is empty (%.1fW) -> reset to idle", self.name, self.current_power)
            self.state = STATE_IDLE
            self.active_device = None
            self.sleeping_device = None
            self._notify()
            return

        # Case 2: Power > 1.5W -> something drawing power!
        # Check if sleeping device is still charging
        is_sleeping_dev_connected = False
        if self.sleeping_device:
            bs = self.hass.states.get(self.sleeping_device.battery_state_entity)
            ct = self.hass.states.get(self.sleeping_device.charger_type_entity)
            if (bs and bs.state in ("charging", "full")) or (ct and ct.state in ("ac", "usb", "wireless", "dock")):
                is_sleeping_dev_connected = True

        if is_sleeping_dev_connected:
            _LOGGER.info("Probe on %s: %s still connected -> sleep for 30m", self.name, self.sleeping_device.name)
            self.state = STATE_SLEEP
            await self._turn_switch(False)
            self._schedule_probe(PROBE_SLEEP_MINUTES)
        else:
            # Different device connected! Check devices or generic
            _LOGGER.info("Probe on %s: device changed -> re-evaluating", self.name)
            await self._async_identify_connected_device()

        self._notify()

    async def _async_confirm_unplugged(self, *_: Any) -> None:
        """Confirm device unplugged after power dropped for 20 seconds."""
        self._power_drop_cancel = None
        if self.current_power < POWER_DROPPED_THRESHOLD and self.state in (
            STATE_CHARGING,
            STATE_GENERIC,
            STATE_MANUAL_100,
        ):
            _LOGGER.info("Device unplugged from %s -> state idle", self.name)
            self.state = STATE_IDLE
            self.active_device = None
            self._notify()

    def _schedule_safety_timeout(self) -> None:
        """Schedule safety cutoff for manual 100% mode."""
        if self._unsub_timer:
            self._unsub_timer()
        self._unsub_timer = async_call_later(
            self.hass, SAFETY_TIMEOUT_HOURS * 3600, self._async_safety_timeout
        )

    async def _async_safety_timeout(self, *_: Any) -> None:
        """Cut power after 3 hours of manual charging."""
        self._unsub_timer = None
        if self.state == STATE_MANUAL_100:
            _LOGGER.warning("Safety timeout (3h) reached on %s -> turning off", self.name)
            await self._turn_switch(False)
            self.state = STATE_IDLE
            self.active_device = None
            self._notify()

    async def _turn_switch(self, on: bool) -> None:
        """Turn switch on/off."""
        service = "turn_on" if on else "turn_off"
        await self.hass.services.async_call(
            "switch", service, {"entity_id": self.switch_entity}, blocking=True
        )

    async def async_force_100(self) -> None:
        """Force 100% charging manually."""
        _LOGGER.info("Force 100% requested on %s", self.name)
        self.state = STATE_MANUAL_100
        await self._turn_switch(True)
        self._schedule_safety_timeout()
        self._notify()

    async def async_stop(self) -> None:
        """Stop charging manually."""
        _LOGGER.info("Stop charging requested on %s", self.name)
        self.state = STATE_IDLE
        self.active_device = None
        self.sleeping_device = None
        if self._unsub_timer:
            self._unsub_timer()
            self._unsub_timer = None
        await self._turn_switch(False)
        self._notify()


class SmartChargerCoordinator:
    """Coordinator holding all charger sockets."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.chargers: dict[str, SmartChargerSocket] = {}
        self._update_listeners: list[CALLBACK_TYPE] = []

    def register_listener(self, listener: CALLBACK_TYPE) -> CALLBACK_TYPE:
        """Register a listener for state changes."""
        self._update_listeners.append(listener)

        def _remove() -> None:
            if listener in self._update_listeners:
                self._update_listeners.remove(listener)

        return _remove

    def notify_all(self) -> None:
        """Notify all registered entity listeners."""
        for listener in self._update_listeners:
            listener()
