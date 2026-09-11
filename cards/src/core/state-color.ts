/**
 * Icon colour by state — the same algorithm as in
 * home-assistant/frontend: src/common/entity/state_color.ts.
 *
 * Their module cannot be reused, it is not published, so the logic is mirrored.
 * The point is for a card to be coloured exactly like the stock tile and to pick
 * up user themes.
 */
import type { HassEntity } from "./types";

const UNAVAILABLE = "unavailable";
const UNKNOWN = "unknown";
const OFF = "off";

const TIMESTAMP_STATE_DOMAINS = new Set(["button", "input_button", "scene"]);

const STATE_COLORED_DOMAIN = new Set([
  "alarm_control_panel",
  "alert",
  "automation",
  "binary_sensor",
  "calendar",
  "camera",
  "climate",
  "cover",
  "device_tracker",
  "fan",
  "group",
  "humidifier",
  "input_boolean",
  "lawn_mower",
  "light",
  "lock",
  "media_player",
  "person",
  "plant",
  "remote",
  "schedule",
  "script",
  "siren",
  "sun",
  "switch",
  "timer",
  "update",
  "vacuum",
  "valve",
  "water_heater",
  "weather",
]);

export const computeDomain = (entityId: string): string =>
  entityId.substring(0, entityId.indexOf("."));

/** The same slugify HA builds state CSS variable names with. */
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "unknown";

export function stateActive(stateObj: HassEntity, state?: string): boolean {
  const domain = computeDomain(stateObj.entity_id);
  const compareState = state !== undefined ? state : stateObj.state;

  if (TIMESTAMP_STATE_DOMAINS.has(domain)) {
    return compareState !== UNAVAILABLE;
  }
  if (compareState === UNAVAILABLE || compareState === UNKNOWN) {
    return false;
  }
  if (compareState === OFF && domain !== "alert") {
    return false;
  }

  switch (domain) {
    case "alarm_control_panel":
      return compareState !== "disarmed";
    case "alert":
      return compareState !== "idle";
    case "cover":
    case "valve":
      return compareState !== "closed";
    case "device_tracker":
    case "person":
      return compareState !== "not_home";
    case "lawn_mower":
      return !["docked", "paused"].includes(compareState);
    case "lock":
      return compareState !== "locked";
    case "media_player":
      return compareState !== "standby";
    case "vacuum":
      return !["idle", "docked", "paused"].includes(compareState);
    case "plant":
      return compareState === "problem";
    case "group":
      return ["on", "home", "open", "locked", "problem"].includes(compareState);
    case "timer":
      return compareState === "active";
    case "camera":
      return ["streaming", "recording"].includes(compareState);
    default:
      return true;
  }
}

/** Builds the var(--a, var(--b, ...)) chain — like computeCssVariable in HA. */
export const cssVariableChain = (props: string[]): string | undefined =>
  props.reduceRight<string | undefined>(
    (fallback, variable) => `var(${variable}${fallback ? `, ${fallback}` : ""})`,
    undefined
  );

/** Battery charge colour — HA has a separate rule for it. */
const batteryStateColorProperty = (state: string): string | undefined => {
  const value = Number(state);
  if (isNaN(value)) return undefined;
  if (value >= 70) return "--state-sensor-battery-high-color";
  if (value >= 30) return "--state-sensor-battery-medium-color";
  return "--state-sensor-battery-low-color";
};

export function stateColorCss(
  stateObj: HassEntity | undefined,
  fallback?: string
): string | undefined {
  if (!stateObj) return fallback;
  if (stateObj.state === UNAVAILABLE) {
    return "var(--state-unavailable-color)";
  }

  const domain = computeDomain(stateObj.entity_id);
  const deviceClass = stateObj.attributes.device_class;

  if (domain === "sensor" && deviceClass === "battery") {
    const property = batteryStateColorProperty(stateObj.state);
    if (property) return `var(${property})`;
  }

  if (!STATE_COLORED_DOMAIN.has(domain)) {
    // HA does not colour numeric sensors — the tile stays neutral.
    return fallback;
  }

  const active = stateActive(stateObj);
  const stateKey = slugify(stateObj.state);
  const activeKey = active ? "active" : "inactive";

  const properties: string[] = [];
  if (deviceClass) {
    properties.push(`--state-${domain}-${deviceClass}-${stateKey}-color`);
  }
  properties.push(
    `--state-${domain}-${stateKey}-color`,
    `--state-${domain}-${activeKey}-color`,
    `--state-${activeKey}-color`
  );

  return cssVariableChain(properties);
}

const hex = (value: number) =>
  Math.round(value).toString(16).padStart(2, "0");

/** RGB → HSV → RGB, ported from HA's convert-color: the tile needs both ways. */
const rgb2hsv = ([r, g, b]: number[]): [number, number, number] => {
  const v = Math.max(r, g, b);
  const c = v - Math.min(r, g, b);
  const h =
    c && (v === r ? (g - b) / c : v === g ? 2 + (b - r) / c : 4 + (r - g) / c);
  return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
};

const hsv2rgb = ([h, s, v]: [number, number, number]): number[] => {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  };
  return [f(5), f(3), f(1)];
};

/**
 * The colour a lit lamp paints its tile with — the stock tile's rule, tweaks
 * and all: a very pale colour is pushed towards white and a merely washed-out
 * one is saturated, because the real rgb of a warm white bulb is invisible on
 * a card.
 */
function lightColor(stateObj: HassEntity): string | undefined {
  const rgb = stateObj.attributes.rgb_color as number[] | undefined;
  if (!Array.isArray(rgb) || rgb.length < 3) return undefined;
  const hsv = rgb2hsv(rgb);
  if (hsv[1] < 0.4) {
    if (hsv[1] < 0.1) {
      hsv[2] = 225;
    } else {
      hsv[1] = 0.4;
    }
  }
  const [r, g, b] = hsv2rgb(hsv);
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

/**
 * Tile colour exactly by hui-tile-card's logic: a lit lamp gives its own
 * colour, otherwise a state with a colour of its own gives that, otherwise an
 * active entity is painted --state-icon-color and an inactive one stays
 * neutral.
 *
 * The one branch left out is the stock tile's exception for person and
 * device_tracker, where the colour sits on a badge instead. We draw no badge,
 * so the colour is the only thing that says whether someone is home.
 */
export function tileColor(stateObj: HassEntity | undefined): string {
  if (!stateObj) return "var(--state-inactive-color)";
  if (computeDomain(stateObj.entity_id) === "light" && stateActive(stateObj)) {
    const color = lightColor(stateObj);
    if (color) return color;
  }
  const stateColor = stateColorCss(stateObj);
  if (stateColor) return stateColor;
  return stateActive(stateObj)
    ? "var(--state-icon-color)"
    : "var(--state-inactive-color)";
}
