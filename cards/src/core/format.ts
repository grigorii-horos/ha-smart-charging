/**
 * Resolving config roles into values ready to render.
 *
 * Formatting is delegated entirely to `hass.formatEntityState`: units, rounding,
 * decimal separator and locale then match the rest of Home Assistant.
 * There is no formatting of our own here, and there should not be.
 */
import type { HassEntity, HomeAssistant } from "./types";

export const UNAVAILABLE_STATES = new Set(["unavailable", "unknown"]);

/**
 * Quantities that have no negative half: a concentration, a share of something
 * present, a light level. A device that reports a minus there is not measuring
 * a low value, it is saying it has nothing to report — which is exactly what an
 * air purifier's PM2.5 does while the fan is off, `-1`. Drawing that as
 * "-1 μg/m³" is worse than drawing nothing.
 */
const NEVER_NEGATIVE = new Set([
  "aqi",
  "battery",
  "carbon_dioxide",
  "carbon_monoxide",
  "humidity",
  "illuminance",
  "moisture",
  "nitrogen_dioxide",
  "nitrogen_monoxide",
  "nitrous_oxide",
  "ozone",
  "pm1",
  "pm10",
  "pm25",
  "sulphur_dioxide",
  "volatile_organic_compounds",
  "volatile_organic_compounds_parts",
]);

/** Whether the state is a number this quantity cannot take. */
export function impossibleValue(stateObj: HassEntity | undefined): boolean {
  const deviceClass = stateObj?.attributes.device_class as string | undefined;
  if (!deviceClass || !NEVER_NEGATIVE.has(deviceClass)) return false;
  const value = Number(stateObj!.state);
  return Number.isFinite(value) && value < 0;
}

export const SECONDARY_SEPARATOR = " · ";

export interface ResolvedRole {
  entityId: string;
  stateObj?: HassEntity;
  /** The entity is not in HA — almost always a typo in the config. */
  missing: boolean;
  /** The entity exists but has no data: unavailable or unknown. */
  unavailable: boolean;
  /**
   * The entity answers, but with a number its quantity cannot take. Kept apart
   * from `unavailable`: there is nothing to show, yet nothing to report either —
   * the sensor is fine, it just has no reading right now.
   */
  impossible: boolean;
}

export function resolveRole(
  hass: HomeAssistant | undefined,
  entityId: string | undefined
): ResolvedRole | undefined {
  if (!entityId) return undefined;
  const stateObj = hass?.states[entityId];
  return {
    entityId,
    stateObj,
    missing: !stateObj,
    unavailable: !!stateObj && UNAVAILABLE_STATES.has(stateObj.state),
    impossible: impossibleValue(stateObj),
  };
}

/**
 * A string ready to show for a role, or undefined if there is nothing to show.
 * An optional role without data simply disappears from the secondary line, and
 * the card keeps working.
 */
export function formatRole(
  hass: HomeAssistant | undefined,
  role: ResolvedRole | undefined
): string | undefined {
  if (!hass || !role || !role.stateObj || role.missing || role.unavailable) {
    return undefined;
  }
  if (role.impossible) return undefined;
  return hass.formatEntityState(role.stateObj);
}

/**
 * An attribute the way Home Assistant itself renders it: with its unit and in
 * the user's locale. Undefined when the entity has no such attribute — an
 * optional role then simply leaves the line, as everywhere else here.
 */
export function formatAttribute(
  hass: HomeAssistant | undefined,
  stateObj: HassEntity | undefined,
  attribute: string
): string | undefined {
  const value = stateObj?.attributes[attribute];
  if (value === undefined || value === null || value === "") return undefined;
  return (
    hass?.formatEntityAttributeValue?.(stateObj!, attribute) ?? String(value)
  );
}

/**
 * A piece of the secondary line. It knows its own entity, so a tap on it opens
 * more-info for that entity rather than for the card's main one.
 */
export interface Segment {
  text?: string;
  /** Ready-made markup instead of text: the stock state-display, for example. */
  content?: unknown;
  entityId?: string;
}

/** Assembles the secondary line, dropping the roles that are not filled in. */
export function composeSegments(parts: (Segment | undefined)[]): Segment[] {
  return parts.filter(
    (part): part is Segment =>
      !!part && (part.content !== undefined || (part.text ?? "").trim() !== "")
  );
}

/** A line piece for a role, or undefined if there is nothing to show. */
export function roleSegment(
  hass: HomeAssistant | undefined,
  role: ResolvedRole | undefined
): Segment | undefined {
  const text = formatRole(hass, role);
  return text ? { text, entityId: role?.entityId } : undefined;
}

/** A line piece with the entity's unavailability status. */
export function unavailableSegment(
  hass: HomeAssistant | undefined,
  role: ResolvedRole | undefined
): Segment | undefined {
  const text = formatUnavailable(hass, role);
  return text ? { text, entityId: role?.entityId } : undefined;
}

/**
 * The status text for a role that is unavailable. The secondary line needs it:
 * the large value is not shown at all in that case, otherwise a long word like
 * "Unavailable" takes the number's place and breaks the line.
 */
export function formatUnavailable(
  hass: HomeAssistant | undefined,
  role: ResolvedRole | undefined
): string | undefined {
  if (!hass || !role?.stateObj || !role.unavailable) return undefined;
  return hass.formatEntityState(role.stateObj);
}

/** The number from an entity's state, or undefined if it is not numeric. */
export function numericState(
  role: ResolvedRole | undefined
): number | undefined {
  if (!role?.stateObj || role.impossible) return undefined;
  const value = Number(role.stateObj.state);
  return Number.isFinite(value) ? value : undefined;
}

/** The card name: from the config, otherwise the main entity's name. */
export function cardName(
  configName: string | undefined,
  role: ResolvedRole | undefined
): string {
  if (configName) return configName;
  return role?.stateObj?.attributes.friendly_name ?? role?.entityId ?? "";
}

/** Splits off the unit so it can be shown smaller than the number itself. */
export function splitValueUnit(
  formatted: string,
  unit: string | undefined
): { value: string; unit?: string } {
  if (!unit) return { value: formatted };
  if (!formatted.endsWith(unit)) return { value: formatted };
  const value = formatted.slice(0, formatted.length - unit.length).trimEnd();
  return value ? { value, unit } : { value: formatted };
}
