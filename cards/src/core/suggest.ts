/**
 * Suggestions for the "Add to dashboard → By entity" dialog.
 *
 * HA asks every custom card what it would build for the entity the user just
 * picked and shows the answers under "Community". A card that answers gets
 * offered right where the entity is chosen, instead of having to be found by
 * name in the full card list.
 *
 * This is not the auto-detection the cards refuse to do. A suggestion is a
 * draft the user sees rendered and can edit before adding, and the rules here
 * are objective — domain, `device_class`, entity attributes, membership of one
 * device. Nothing is guessed from names.
 *
 * A card only suggests itself when it would say more than the stock tile:
 * either it fills more than one role, or it brings something the tile has no
 * form of at all — ink levels, the batteries of the whole house.
 */
import { computeDomain } from "./state-color";
import type { CardSuggestion, HomeAssistant } from "./types";

/** How many entities a list card takes into its suggested config. */
const LIST_CAP = 20;

export function deviceClassOf(
  hass: HomeAssistant,
  entityId: string
): string | undefined {
  return hass.states[entityId]?.attributes.device_class as string | undefined;
}

function hidden(hass: HomeAssistant, entityId: string): boolean {
  return hass.entities?.[entityId]?.hidden === true;
}

/**
 * The picked entity and the rest of its device.
 *
 * The device is the one grouping worth trusting: it comes from the registry,
 * not from a name that happens to share a prefix. The picked entity comes
 * first so that it wins its role over any sibling of the same kind.
 */
export function devicePool(hass: HomeAssistant, entityId: string): string[] {
  const deviceId = hass.entities?.[entityId]?.device_id;
  if (!deviceId || !hass.entities) return [entityId];
  const rest = Object.keys(hass.entities).filter(
    (id) =>
      id !== entityId &&
      hass.entities?.[id]?.device_id === deviceId &&
      !hidden(hass, id) &&
      hass.states[id] !== undefined
  );
  return [entityId, ...rest.sort()];
}

/** The first entity of the pool with that domain and device class. */
export function byClass(
  hass: HomeAssistant,
  ids: string[],
  domain: string,
  ...classes: string[]
): string | undefined {
  return ids.find(
    (id) =>
      computeDomain(id) === domain &&
      classes.includes(deviceClassOf(hass, id) ?? "")
  );
}

/** The first entity of the pool in that domain, whatever its device class. */
export function byDomain(
  ids: string[],
  ...domains: string[]
): string | undefined {
  return ids.find((id) => domains.includes(computeDomain(id)));
}

/**
 * Every entity in the house of that domain and device class, the picked one
 * first.
 *
 * The list cards — batteries, safety, presence, energy — are about a set, not
 * about one entity: a card holding the single battery the user happened to
 * click says less than the stock tile does. So the suggestion arrives filled
 * with the whole set, and the user removes what they do not want.
 */
export function allOfClass(
  hass: HomeAssistant,
  entityId: string,
  domain: string,
  classes: string[],
  cap: number = LIST_CAP,
  keep: (id: string) => boolean = () => true
): string[] {
  const rest = Object.keys(hass.states)
    .filter(
      (id) =>
        id !== entityId &&
        computeDomain(id) === domain &&
        classes.includes(deviceClassOf(hass, id) ?? "") &&
        !hidden(hass, id) &&
        keep(id)
    )
    .sort();
  const picked = keep(entityId) ? [entityId] : [];
  return [...picked, ...rest].slice(0, cap);
}

/** Whether the entity belongs to a device at all. */
export function hasDevice(hass: HomeAssistant, entityId: string): boolean {
  return hass.entities?.[entityId]?.device_id !== undefined;
}

/** The area an entity sits in, its own or the one its device is placed in. */
export function areaOf(
  hass: HomeAssistant,
  entityId: string
): string | undefined {
  const entry = hass.entities?.[entityId];
  if (!entry) return undefined;
  if (entry.area_id) return entry.area_id;
  return entry.device_id ? hass.devices?.[entry.device_id]?.area_id : undefined;
}

/**
 * Every entity of that domain sitting in the same area as the picked one.
 *
 * What makes five lamps "the lights of the living room" is the area, not their
 * names. The picked entity comes first; entities with no area are not part of a
 * room and stay out.
 */
export function sameArea(
  hass: HomeAssistant,
  entityId: string,
  domain: string,
  cap: number = LIST_CAP
): string[] {
  const area = areaOf(hass, entityId);
  if (!area) return [];
  const rest = Object.keys(hass.states)
    .filter(
      (id) =>
        id !== entityId &&
        computeDomain(id) === domain &&
        !hidden(hass, id) &&
        areaOf(hass, id) === area
    )
    .sort();
  const picked = computeDomain(entityId) === domain ? [entityId] : [];
  return [...picked, ...rest].slice(0, cap);
}

/**
 * One entity per area, classes tried in the order given.
 *
 * A house has several sensors watching the same room — a motion detector, a
 * presence radar, the aggregate an integration derives from them — and listing
 * all of them says "kitchen" three times. The registry knows which area each
 * one is in, so the card takes the best one per area: whoever is first in
 * `classes` wins, and the entity the user picked always keeps its area.
 *
 * Entities with no area are left out. They are not about a room.
 */
export function onePerArea(
  hass: HomeAssistant,
  entityId: string,
  domain: string,
  classes: string[],
  cap: number = LIST_CAP
): string[] {
  const rank = (id: string) => classes.indexOf(deviceClassOf(hass, id) ?? "");
  const candidates = Object.keys(hass.states)
    .filter(
      (id) =>
        id !== entityId &&
        computeDomain(id) === domain &&
        rank(id) >= 0 &&
        !hidden(hass, id) &&
        areaOf(hass, id) !== undefined
    )
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

  const perArea = new Map<string, string>();
  const pickedArea = areaOf(hass, entityId);
  if (pickedArea) perArea.set(pickedArea, entityId);
  for (const id of candidates) {
    const area = areaOf(hass, id)!;
    if (!perArea.has(area)) perArea.set(area, id);
  }
  const chosen = [...perArea.values()];
  const rest = chosen.filter((id) => id !== entityId);
  return [entityId, ...rest].slice(0, cap);
}

/** A config with the roles that were actually found, and nothing else. */
export function suggestion(
  type: string,
  roles: Record<string, string | undefined>,
  extra: Record<string, unknown> = {}
): CardSuggestion {
  const config: CardSuggestion["config"] = { type, ...extra };
  for (const [key, entityId] of Object.entries(roles)) {
    if (entityId) config[key] = entityId;
  }
  return { config };
}

/** How many of the roles were filled. */
export function filled(roles: Record<string, string | undefined>): number {
  return Object.values(roles).filter(Boolean).length;
}
