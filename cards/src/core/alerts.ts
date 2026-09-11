/**
 * What counts as an alert having fired.
 *
 * A separate DOM-free module, like the rest of the pure logic, so tests can
 * cover it: "has this fired" is the one question the alerts card exists to
 * answer, and getting it wrong means either crying wolf or staying silent
 * about the thing the owner asked to be told.
 */
import type { EntityItem } from "./entity-item";

/** What a binary sensor looks like when it has something to say. */
export const DEFAULT_ALERT_STATE = "on";

export interface AlertItem extends EntityItem {
  /**
   * Which states count as fired. A binary sensor needs nothing here; anything
   * else has to say — `["jam", "error"]` for a printer, `["open"]` for a door.
   */
  alert_when?: string | string[];
}

/** The states this alert fires on, one way or another. */
export function firingStates(item: AlertItem): string[] {
  const when = item.alert_when;
  if (when === undefined) return [DEFAULT_ALERT_STATE];
  return Array.isArray(when) ? when : [when];
}

/**
 * Whether the entity is in one of those states.
 *
 * `unavailable` and `unknown` never count as fired even when listed: an entity
 * with no data has not told us anything, and the card says that separately.
 */
export function isFiring(item: AlertItem, state: string | undefined): boolean {
  if (state === undefined || state === "unavailable" || state === "unknown") {
    return false;
  }
  return firingStates(item).includes(state);
}
