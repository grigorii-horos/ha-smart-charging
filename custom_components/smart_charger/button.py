"""Button platform for Smart Charger."""
from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .coordinator import SmartChargerCoordinator, SmartChargerSocket


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Smart Charger button based on a config entry."""
    coordinator: SmartChargerCoordinator = hass.data[DOMAIN][entry.entry_id]

    entities: list[ButtonEntity] = []
    for charger in coordinator.chargers.values():
        entities.append(SmartChargerForce100Button(charger))
        entities.append(SmartChargerStopButton(charger))

    async_add_entities(entities)


class SmartChargerForce100Button(ButtonEntity):
    """Button to force 100% charging."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:battery-charging-100"

    def __init__(self, charger: SmartChargerSocket) -> None:
        self._charger = charger
        self._attr_unique_id = f"{charger.charger_id}_force_100"
        self._attr_name = "Force 100%"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, charger.charger_id)},
            "name": charger.name,
            "manufacturer": "Horos",
            "model": "Smart Charger",
        }

    async def async_press(self) -> None:
        """Handle button press."""
        await self._charger.async_force_100()


class SmartChargerStopButton(ButtonEntity):
    """Button to stop charging."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:stop"

    def __init__(self, charger: SmartChargerSocket) -> None:
        self._charger = charger
        self._attr_unique_id = f"{charger.charger_id}_stop"
        self._attr_name = "Stop"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, charger.charger_id)},
            "name": charger.name,
            "manufacturer": "Horos",
            "model": "Smart Charger",
        }

    async def async_press(self) -> None:
        """Handle button press."""
        await self._charger.async_stop()
