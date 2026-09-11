"""Smart Charger integration for Home Assistant."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from .const import (
    CONF_CHARGERS,
    CONF_DEVICES,
    CONF_NAME,
    CONF_POWER,
    CONF_SWITCH,
    DOMAIN,
)
from .coordinator import ChargerDevice, SmartChargerCoordinator, SmartChargerSocket

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.BUTTON,
    Platform.SWITCH,
]

SERVICE_FORCE_100 = "force_100"
SERVICE_STOP = "stop"

SERVICE_SCHEMA = vol.Schema(
    {
        vol.Optional("charger_id"): cv.string,
        vol.Optional("entity_id"): cv.entity_ids,
    }
)


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up the Smart Charger component."""
    hass.data.setdefault(DOMAIN, {})

    async def handle_force_100(call: ServiceCall) -> None:
        charger_id = call.data.get("charger_id")
        for entry_id, coordinator in hass.data.get(DOMAIN, {}).items():
            if not isinstance(coordinator, SmartChargerCoordinator):
                continue
            if charger_id and charger_id in coordinator.chargers:
                await coordinator.chargers[charger_id].async_force_100()
                return
            for cid, charger in coordinator.chargers.items():
                if not charger_id or cid == charger_id:
                    await charger.async_force_100()

    async def handle_stop(call: ServiceCall) -> None:
        charger_id = call.data.get("charger_id")
        for entry_id, coordinator in hass.data.get(DOMAIN, {}).items():
            if not isinstance(coordinator, SmartChargerCoordinator):
                continue
            if charger_id and charger_id in coordinator.chargers:
                await coordinator.chargers[charger_id].async_stop()
                return
            for cid, charger in coordinator.chargers.items():
                if not charger_id or cid == charger_id:
                    await charger.async_stop()

    hass.services.async_register(
        DOMAIN, SERVICE_FORCE_100, handle_force_100, schema=SERVICE_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_STOP, handle_stop, schema=SERVICE_SCHEMA
    )

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Smart Charger from a config entry."""
    data = {**entry.data, **entry.options}
    coordinator = SmartChargerCoordinator(hass)

    raw_chargers = data.get(CONF_CHARGERS, [])
    raw_devices = data.get(CONF_DEVICES, [])

    # If single charger configured at top level
    if not raw_chargers and CONF_SWITCH in data:
        raw_chargers = [
            {
                "id": entry.entry_id,
                CONF_NAME: data.get(CONF_NAME, entry.title),
                CONF_SWITCH: data[CONF_SWITCH],
                CONF_POWER: data[CONF_POWER],
            }
        ]

    # Shared device objects
    devices = [ChargerDevice(d) for d in raw_devices]

    for c in raw_chargers:
        charger_id = str(c.get("id") or c.get(CONF_SWITCH))
        name = c.get(CONF_NAME, charger_id)
        switch_ent = c[CONF_SWITCH]
        power_ent = c[CONF_POWER]

        socket = SmartChargerSocket(
            hass=hass,
            charger_id=charger_id,
            name=name,
            switch_entity=switch_ent,
            power_entity=power_ent,
            devices=devices,
            update_callback=coordinator.notify_all,
        )
        await socket.async_setup()
        coordinator.chargers[charger_id] = socket

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        coordinator: SmartChargerCoordinator = hass.data[DOMAIN].pop(entry.entry_id)
        for charger in coordinator.chargers.values():
            charger.async_unload()
    return unload_ok


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry."""
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)
