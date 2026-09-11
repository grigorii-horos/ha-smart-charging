/**
 * Finding what asks to be updated.
 *
 * The second card that walks the states itself rather than taking entities from
 * the config, and for the same reason as the offline one: the rule is objective
 * — an `update` entity that is `on` — and listing thirty of them by hand to
 * learn that none of them needs anything is work with no answer at the end.
 *
 * A skipped version is counted apart. HA keeps such an entity `on` for ever,
 * and a card that shouts about an update the owner has already waved away is a
 * card one learns to ignore.
 */
import type { HomeAssistant } from "./types";

export interface UpdateItem {
  entityId: string;
  /** The device's name where there is one: "Home Assistant Core", not its entity. */
  name: string;
  /** The version being offered, when the entity says. */
  version?: string;
  /** The owner has already skipped this exact version. */
  skipped: boolean;
}

export interface UpdateOptions {
  ignore?: string[];
}

export function findUpdates(
  hass: HomeAssistant | undefined,
  options: UpdateOptions = {}
): UpdateItem[] {
  if (!hass) return [];
  const ignored = new Set(options.ignore ?? []);
  const items: UpdateItem[] = [];

  for (const [entityId, stateObj] of Object.entries(hass.states)) {
    if (!entityId.startsWith("update.") || stateObj?.state !== "on") continue;
    if (ignored.has(entityId)) continue;

    const registry = hass.entities?.[entityId];
    if (registry?.hidden) continue;

    const device = registry?.device_id
      ? hass.devices?.[registry.device_id]
      : undefined;
    const version = stateObj.attributes.latest_version as string | undefined;

    items.push({
      entityId,
      name:
        device?.name_by_user ??
        device?.name ??
        (stateObj.attributes.title as string | undefined) ??
        stateObj.attributes.friendly_name ??
        entityId,
      version,
      skipped:
        version !== undefined &&
        version === (stateObj.attributes.skipped_version as string | undefined),
    });
  }

  // Alphabetical: the list is read, not ranked, and it must not reshuffle
  // itself between updates.
  return items.sort((a, b) => a.name.localeCompare(b.name));
}
