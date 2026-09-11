"""Sensor platform for Smart Charger."""
from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, STATE_IDLE
from .coordinator import SmartChargerCoordinator, SmartChargerSocket


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Smart Charger sensor based on a config entry."""
    coordinator: SmartChargerCoordinator = hass.data[DOMAIN][entry.entry_id]

    entities = [
        SmartChargerStatusSensor(coordinator, charger)
        for charger in coordinator.chargers.values()
    ]
    async_add_entities(entities)


class SmartChargerStatusSensor(SensorEntity):
    """Representation of a Smart Charger status sensor."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:battery-charging"

    def __init__(
        self, coordinator: SmartChargerCoordinator, charger: SmartChargerSocket
    ) -> None:
        self._coordinator = coordinator
        self._charger = charger
        self._attr_unique_id = f"{charger.charger_id}_status"
        self._attr_name = "Status"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, charger.charger_id)},
            "name": charger.name,
            "manufacturer": "Horos",
            "model": "Smart Charger",
        }

    @property
    def native_value(self) -> str:
        """Return current charging state."""
        return self._charger.state

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return state attributes for Lovelace card."""
        dev = self._charger.active_device or self._charger.sleeping_device
        battery_level = None
        min_charge = None
        max_charge = None

        if dev:
            state = self.hass.states.get(dev.battery_level_entity)
            if state and state.state.replace('.', '', 1).isdigit():
                battery_level = float(state.state)
            min_charge = dev.min_charge
            max_charge = dev.max_charge

        return {
            "charger_id": self._charger.charger_id,
            "charger_name": self._charger.name,
            "switch_entity": self._charger.switch_entity,
            "power_entity": self._charger.power_entity,
            "power_w": self._charger.current_power,
            "connected_device": dev.name if dev else None,
            "battery_level": battery_level,
            "min_charge": min_charge,
            "max_charge": max_charge,
            "is_probing": self._charger._is_probing,
        }

    async def async_added_to_hass(self) -> None:
        """Register callbacks."""
        self.async_on_remove(
            self._coordinator.register_listener(self._handle_coordinator_update)
        )

    @callback
    def _handle_coordinator_update(self) -> None:
        """Update sensor when coordinator state changes."""
        self.async_write_ha_state()
