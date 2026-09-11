/**
 * Labels derived from entity names. DOM-free — covered by tests.
 */

/**
 * Strips the device name out of an entity name: the card heading already said
 * it. "Canon G3030 series Cyan" under a printer named "Canon G3030 series"
 * becomes "Cyan". If nothing is left after the cut, the name is kept as is.
 */
export function stripDeviceName(
  friendlyName: string | undefined,
  deviceName: string | undefined
): string | undefined {
  if (!friendlyName) return undefined;
  if (deviceName && friendlyName.startsWith(deviceName)) {
    const rest = friendlyName.slice(deviceName.length).trim();
    if (rest) return rest;
  }
  return friendlyName;
}

/**
 * Strips the "Battery level" tail off a battery sensor name. "Phone Olga
 * Battery level" on a card that is entirely about battery repeats the obvious —
 * "Phone Olga" is enough.
 */
export function stripBatterySuffix(
  name: string | undefined
): string | undefined {
  if (!name) return undefined;
  // The Russian word is there on purpose: entity names follow the HA UI language.
  const stripped = name.replace(/[\s—-]*(battery(\s+level)?|заряд)\s*$/i, "").trim();
  return stripped || name;
}

/**
 * Strips the "moisture" tail off a soil sensor name. On a card whose every row
 * is a moisture reading, "Balcony Orange Soil moisture" says the last two words
 * for nothing — "Balcony Orange" is the plant.
 */
export function stripMoistureSuffix(
  name: string | undefined
): string | undefined {
  if (!name) return undefined;
  // The Russian is there on purpose: entity names follow the HA UI language.
  const stripped = name
    .replace(
      /[\s—-]*(soil\s+)?(moisture|влажность(\s+почвы)?)\s*$/i,
      ""
    )
    .trim();
  return stripped || name;
}

/**
 * Level colour — the same steps HA paints batteries with: 70 and 30 per cent.
 * It suits consumables too: the question there is the same, "will it run out
 * soon".
 */
export function levelColor(level: number | undefined): string {
  if (level === undefined) return "var(--state-unavailable-color)";
  if (level >= 70) return "var(--state-sensor-battery-high-color, #4caf50)";
  if (level >= 30) return "var(--state-sensor-battery-medium-color, #ffa600)";
  return "var(--state-sensor-battery-low-color, #db4437)";
}

/** The former name: batteries mean the same thing. */
export const batteryColor = levelColor;

/**
 * Load colour — the inverse of level colour. On a battery a lot is good; on CPU
 * load and disk usage it is the other way round: the higher, the more alarming.
 */
export function loadColor(level: number | undefined): string {
  if (level === undefined) return "var(--state-unavailable-color)";
  if (level >= 90) return "var(--error-color, #db4437)";
  if (level >= 80) return "var(--warning-color, #ffa600)";
  return "var(--state-icon-color)";
}
