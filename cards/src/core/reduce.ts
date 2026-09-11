/**
 * Reducing a list of homogeneous sensors to one.
 *
 * A computer has twelve temperature sensors and three disk partitions. Listing
 * them is pointless: the question is always the same — how hot and how full.
 * So the extreme one is picked out of the list and becomes an ordinary role: a
 * tap on it opens exactly the sensor that is extreme right now.
 */
import { numericState, resolveRole, type ResolvedRole } from "./format";
import type { HomeAssistant } from "./types";

export type Extreme = "max" | "min";

export function pickExtreme(
  hass: HomeAssistant | undefined,
  entityIds: string[] | undefined,
  mode: Extreme
): ResolvedRole | undefined {
  if (!hass || !entityIds?.length) return undefined;

  let best: ResolvedRole | undefined;
  let bestValue: number | undefined;

  for (const entityId of entityIds) {
    const role = resolveRole(hass, entityId);
    const value = numericState(role);
    if (value === undefined) continue;
    if (
      bestValue === undefined ||
      (mode === "max" ? value > bestValue : value < bestValue)
    ) {
      best = role;
      bestValue = value;
    }
  }

  // Not a single number: return the first role so that the card reports the
  // problem instead of pretending there was no list.
  return best ?? resolveRole(hass, entityIds[0]);
}
