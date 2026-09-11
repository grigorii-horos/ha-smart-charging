"""Config flow for Smart Charger integration."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers.selector import (
    BooleanSelector,
    EntitySelector,
    EntitySelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    TextSelector,
)
import voluptuous as vol

from .const import (
    CONF_BATTERY_LEVEL,
    CONF_BATTERY_STATE,
    CONF_CHARGER_TYPE,
    CONF_CHARGERS,
    CONF_DEVICES,
    CONF_EXCLUSIVE_SWITCH,
    CONF_IS_WATCH,
    CONF_MAX_CHARGE,
    CONF_MIN_CHARGE,
    CONF_NAME,
    CONF_POWER,
    CONF_SWITCH,
    DEFAULT_MAX_PHONE,
    DEFAULT_MIN_PHONE,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)


class SmartChargerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Smart Charger."""

    VERSION = 1

    def __init__(self) -> None:
        """Initialize the config flow."""
        self._data: dict[str, Any] = {}
        self._devices: list[dict[str, Any]] = []

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            self._data = user_input
            return await self.async_step_device()

        schema = vol.Schema(
            {
                vol.Required(CONF_NAME, default="Smart Charger"): TextSelector(),
                vol.Required(CONF_SWITCH): EntitySelector(
                    EntitySelectorConfig(domain="switch")
                ),
                vol.Required(CONF_POWER): EntitySelector(
                    EntitySelectorConfig(domain="sensor", device_class="power")
                ),
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=schema,
            errors=errors,
        )

    async def async_step_device(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle adding smart devices to the charger."""
        errors: dict[str, str] = {}

        if user_input is not None:
            # If user filled in a device
            if user_input.get(CONF_NAME) and user_input.get(CONF_BATTERY_LEVEL):
                device = {
                    CONF_NAME: user_input[CONF_NAME],
                    CONF_BATTERY_LEVEL: user_input[CONF_BATTERY_LEVEL],
                    CONF_BATTERY_STATE: user_input[CONF_BATTERY_STATE],
                    CONF_CHARGER_TYPE: user_input[CONF_CHARGER_TYPE],
                    CONF_MIN_CHARGE: user_input.get(CONF_MIN_CHARGE, DEFAULT_MIN_PHONE),
                    CONF_MAX_CHARGE: user_input.get(CONF_MAX_CHARGE, DEFAULT_MAX_PHONE),
                    CONF_IS_WATCH: user_input.get(CONF_IS_WATCH, False),
                    CONF_EXCLUSIVE_SWITCH: user_input.get(CONF_EXCLUSIVE_SWITCH),
                }
                self._devices.append(device)

            if user_input.get("add_another"):
                return await self.async_step_device()

            # Finish flow
            final_data = {
                CONF_NAME: self._data[CONF_NAME],
                CONF_SWITCH: self._data[CONF_SWITCH],
                CONF_POWER: self._data[CONF_POWER],
                CONF_DEVICES: self._devices,
            }
            return self.async_create_entry(
                title=self._data[CONF_NAME],
                data=final_data,
            )

        schema = vol.Schema(
            {
                vol.Optional(CONF_NAME): TextSelector(),
                vol.Optional(CONF_BATTERY_LEVEL): EntitySelector(
                    EntitySelectorConfig(domain="sensor", device_class="battery")
                ),
                vol.Optional(CONF_BATTERY_STATE): EntitySelector(
                    EntitySelectorConfig(domain="sensor")
                ),
                vol.Optional(CONF_CHARGER_TYPE): EntitySelector(
                    EntitySelectorConfig(domain="sensor")
                ),
                vol.Optional(CONF_MIN_CHARGE, default=DEFAULT_MIN_PHONE): NumberSelector(
                    NumberSelectorConfig(min=0, max=100, step=1, mode=NumberSelectorMode.BOX)
                ),
                vol.Optional(CONF_MAX_CHARGE, default=DEFAULT_MAX_PHONE): NumberSelector(
                    NumberSelectorConfig(min=0, max=100, step=1, mode=NumberSelectorMode.BOX)
                ),
                vol.Optional(CONF_IS_WATCH, default=False): BooleanSelector(),
                vol.Optional(CONF_EXCLUSIVE_SWITCH): EntitySelector(
                    EntitySelectorConfig(domain="switch")
                ),
                vol.Optional("add_another", default=False): BooleanSelector(),
            }
        )

        return self.async_show_form(
            step_id="device",
            data_schema=schema,
            errors=errors,
            description_placeholders={
                "device_count": str(len(self._devices)),
            },
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Get the options flow for this handler."""
        return SmartChargerOptionsFlowHandler(config_entry)


class SmartChargerOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle Smart Charger options."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        data = {**self.config_entry.data, **self.config_entry.options}
        schema = vol.Schema(
            {
                vol.Required(CONF_NAME, default=data.get(CONF_NAME, "")): TextSelector(),
                vol.Required(CONF_SWITCH, default=data.get(CONF_SWITCH, "")): EntitySelector(
                    EntitySelectorConfig(domain="switch")
                ),
                vol.Required(CONF_POWER, default=data.get(CONF_POWER, "")): EntitySelector(
                    EntitySelectorConfig(domain="sensor", device_class="power")
                ),
            }
        )

        return self.async_show_form(step_id="init", data_schema=schema)
