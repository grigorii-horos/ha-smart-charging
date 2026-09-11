"""Switch platform for Smart Charger."""
from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .coordinator import SmartChargerCoordinator, SmartChargerSocket


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Smart Charger switch based on a config entry."""
    coordinator: SmartChargerCoordinator = hass.data[DOMAIN][entry.entry_id]

    entities = [
        SmartChargerPowerSwitch(coordinator, charger)
        for charger in coordinator.chargers.values()
    ]
    async_add_entities(entities)


class SmartChargerPowerSwitch(SwitchEntity):
    """Control power to the smart charger socket."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:power"

    def __init__(
        self, coordinator: SmartChargerCoordinator, charger: SmartChargerSocket
    ) -> None:
        self._coordinator = coordinator
        self._charger = charger
        self._attr_unique_id = f"{charger.charger_id}_power"
        self._attr_name = "Power"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, charger.charger_id)},
            "name": charger.name,
            "manufacturer": "Horos",
            "model": "Smart Charger",
        }

    @property
    def is_on(self) -> bool:
        """Return true if underlying socket is on."""
        state = self.hass.states.get(self._charger.switch_entity)
        return state.state == "on" if state else False

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Turn the switch on."""
        await self._charger.async_force_100()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn the switch off."""
        await self._charger.async_stop()

    async def async_added_to_hass(self) -> None:
        """Register callbacks."""
        self.async_on_remove(
            self._coordinator.register_listener(self._handle_coordinator_update)
        )

    @callback
    def _handle_coordinator_update(self) -> None:
        """Update switch state when coordinator updates."""
        self.async_write_ha_state()
