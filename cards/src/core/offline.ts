/**
 * Finding what stopped responding.
 *
 * The one card that walks the states itself instead of taking entities from the
 * config. That is deliberate: listing nine hundred entities by hand is not
 * possible, and the selection rule here is objective — state `unavailable` — so
 * there is nothing to guess.
 *
 * It counts by device, not by entity: a single dead plug has six of them,
 * Syncthing seventeen, and a list of ninety-two lines says less than a list of
 * seventeen devices.
 */
import type { HomeAssistant } from "./types";

/** Service domains: their unavailability means nothing to whoever lives here. */
export const DEFAULT_IGNORED_DOMAINS = [
  "update",
  "select",
  "text",
  "button",
  "number",
  "event",
  "notify",
];

export interface OfflineGroup {
  /** The device name, or the entity's own if it has no device. */
  name: string;
  /** How many entities are silent. */
  count: number;
  /** Which entity to hook the tap onto. */
  entityId: string;
}

export interface OfflineOptions {
  ignore?: string[];
  ignoreDomains?: string[];
}

export function findOffline(
  hass: HomeAssistant | undefined,
  options: OfflineOptions = {}
): OfflineGroup[] {
  if (!hass) return [];

  const ignored = new Set(options.ignore ?? []);
  const ignoredDomains = new Set(
    options.ignoreDomains ?? DEFAULT_IGNORED_DOMAINS
  );

  const groups = new Map<string, OfflineGroup>();

  for (const [entityId, stateObj] of Object.entries(hass.states)) {
    if (!stateObj || stateObj.state !== "unavailable") continue;
    if (ignored.has(entityId)) continue;
    if (ignoredDomains.has(entityId.split(".")[0])) continue;

    const registry = hass.entities?.[entityId];
    if (registry?.hidden) continue;

    const device = registry?.device_id
      ? hass.devices?.[registry.device_id]
      : undefined;
    const name =
      device?.name_by_user ??
      device?.name ??
      stateObj.attributes.friendly_name ??
      entityId;
    const key = registry?.device_id ?? entityId;

    const group = groups.get(key);
    if (group) {
      group.count += 1;
    } else {
      groups.set(key, { name, count: 1, entityId });
    }
  }

  // Whoever is most silent first, ties broken alphabetically, so the list does
  // not jump around between updates.
  return [...groups.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
}
