/**
 * Card strings in English.
 */
import type { HomeAssistant } from "./types";

type Dict = Record<string, string>;

const EN: Dict = {
  "entity.missing.one": "Entity not found: {list}",
  "entity.missing.many": "Entities not found: {list}",
  "internals.failed": "Could not load Home Assistant components",
  "value.unknown": "no data",

  "charger.title": "Smart Charger",
  "charger.idle": "Idle",
  "charger.charging": "Charging",
  "charger.cooldown": "Cooldown",
  "charger.sleep": "Sleep",
  "charger.manual_100": "Manual 100%",
  "charger.generic": "Generic device",
  "charger.force_100": "Force 100%",
  "charger.stop": "Stop",
  "charger.probing": "Probing cable...",
  "charger.connected": "Connected",
  "charger.limit": "Limit {min}% – {max}%",
  "charger.noChargers": "No chargers configured",
};

export function languageOf(_hass: HomeAssistant | undefined): string {
  return "en";
}

function pluralForm(_language: string, count: number): "one" | "many" {
  return count === 1 ? "one" : "many";
}

export function t(
  hass: HomeAssistant | undefined,
  key: string,
  params: Record<string, string | number> = {}
): string {
  const language = languageOf(hass);
  const dict = EN;

  const count = params.count;
  const form =
    typeof count === "number"
      ? `${key}.${pluralForm(language, count)}`
      : undefined;

  const template =
    (form && dict[form]) ?? dict[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in params ? String(params[name]) : whole
  );
}
