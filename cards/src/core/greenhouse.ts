/**
 * Counting the plants of a greenhouse. A DOM-free module of its own so the
 * arithmetic is tested without bringing up a browser.
 */
import type { MoistureStatus } from "./moisture";

export interface PlantReport {
  status: MoistureStatus;
  /** The sensor is not answering at all — unavailable, unknown, gone. */
  offline: boolean;
}

export interface PlantCount {
  /** Below its dryness threshold: wants watering. */
  thirsty: number;
  /** Above the wet one: watered too much. */
  soaked: number;
  /** Plants whose sensor actually said a number. The denominator. */
  reporting: number;
  /** Plants whose sensor is silent. */
  offline: number;
}

/**
 * A silent sensor is not a watered plant.
 *
 * The same rule as the heating card's rooms: a plant that says nothing is
 * counted as offline and left out of the denominator entirely. Counting it as
 * fine is how a card ends up saying "all watered, 5 plants" while three of the
 * five have been dead sensors for a month.
 */
export function countPlants(plants: PlantReport[]): PlantCount {
  const count: PlantCount = { thirsty: 0, soaked: 0, reporting: 0, offline: 0 };
  for (const plant of plants) {
    if (plant.offline) {
      count.offline += 1;
      continue;
    }
    if (plant.status === "unknown") continue;
    count.reporting += 1;
    if (plant.status === "dry") count.thirsty += 1;
    if (plant.status === "wet") count.soaked += 1;
  }
  return count;
}

/**
 * The greenhouse as one plant: the worst of them.
 *
 * Dry beats wet — a plant running out of water dies faster than one standing
 * in it, and the card has one icon to spend.
 */
export function greenhouseStatus(count: PlantCount): MoistureStatus {
  if (count.thirsty) return "dry";
  if (count.soaked) return "wet";
  return count.reporting ? "ok" : "unknown";
}

/** The icon of the whole greenhouse. When all is well it is the greenhouse. */
export const GREENHOUSE_ICON: Record<MoistureStatus, string> = {
  dry: "mdi:watering-can",
  ok: "mdi:greenhouse",
  wet: "mdi:water-alert",
  unknown: "mdi:greenhouse",
};
