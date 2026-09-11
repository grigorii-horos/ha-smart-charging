/**
 * What a heating zone is doing.
 *
 * A separate DOM-free module, like the rest of the pure logic. The question the
 * heating card exists to answer is "who is asking the boiler for heat", and the
 * only honest source for that is `hvac_action`, which a thermostat reports and
 * a simpler one does not. Guessing it from the temperatures — below target, so
 * it must be heating — would be the card inventing a fact: a valve can be shut
 * by a schedule, by an open window, by a boiler that is off.
 */
import { UNAVAILABLE_STATES } from "./format";
import type { HassEntity } from "./types";

export type ZoneState = "heating" | "idle" | "off" | "offline" | "unknown";

/** What the zone reports, without filling in what it does not report. */
export function zoneState(stateObj: HassEntity | undefined): ZoneState {
  if (!stateObj || UNAVAILABLE_STATES.has(stateObj.state)) return "offline";
  if (stateObj.state === "off") return "off";
  const action = stateObj.attributes.hvac_action as string | undefined;
  if (action === undefined) return "unknown";
  return action === "heating" ? "heating" : "idle";
}

/** How many zones are asking, out of how many can answer the question. */
export function countDemand(states: ZoneState[]): {
  calling: number;
  reporting: number;
  offline: number;
} {
  return {
    calling: states.filter((state) => state === "heating").length,
    // "unknown" is left out on purpose: a zone that does not report demand
    // must not swell the denominator of "2 of 5 calling".
    reporting: states.filter(
      (state) => state === "heating" || state === "idle" || state === "off"
    ).length,
    offline: states.filter((state) => state === "offline").length,
  };
}
