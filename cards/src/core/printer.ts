/**
 * Parsing printer entities. A separate DOM-free module so the logic can be
 * tested without bringing up a browser environment.
 */

import { stripDeviceName } from "./labels";
import { normalizeItem, type EntityItem } from "./entity-item";

/**
 * Cartridge colour from the entity name. HA has no palette "magenta"; the
 * closest in meaning is purple, and that is how the printer's own UI shows it.
 */
const CARTRIDGE_COLORS: [RegExp, string][] = [
  [/black|pgbk|_bk(_|$)/i, "black"],
  [/cyan/i, "cyan"],
  [/magenta/i, "purple"],
  [/yellow/i, "yellow"],
  // MC is the maintenance tank, not ink. It gets its own shade, otherwise it is
  // indistinguishable from black: that one is painted in the text colour and
  [/_mc(_|$)|maintenance/i, "blue-grey"],
];

export function cartridgeColor(entityId: string): string | undefined {
  const match = CARTRIDGE_COLORS.find(([pattern]) => pattern.test(entityId));
  return match?.[1];
}

/**
 * The ready CSS colour of the drop.
 *
 * Black ink must not be painted pure black: on a dark theme the drop merges with
 * the card background. We take the text colour — black on a light theme, white
 * on a dark one — which behaves exactly like "the colour of ink on paper".
 */
export function cartridgeCssColor(color: string): string {
  if (color === "black") return "var(--primary-text-color)";
  if (/^(#|rgb|hsl|var\()/.test(color)) return color;
  return `var(--${color}-color, var(--state-icon-color))`;
}

/** The cartridge name without the printer's — the card heading already said it. */
export const cartridgeLabel = stripDeviceName;

/** Former names: a cartridge is a special case of a list item. */
export type CartridgeConfig = EntityItem;
export const normalizeCartridge = normalizeItem;

/**
 * Parsing a printer marker.
 *
 * IPP reports the meaning of a level along with the level. An ink cartridge is
 * consumed: alarm when the level drops below marker_low_level. The waste ink
 * absorber (marker_type "waste-ink") fills up instead: its low_level is zero and
 * the alarm is when the level has grown up to marker_high_level.
 *
 * Treating "low" the same way for both is wrong: for the absorber a low level
 * is good news.
 */
export type MarkerAttributes = Record<string, unknown>;

export interface MarkerReading {
  /** How full the container is, in per cent of its capacity, 0..100. */
  fill: number;
  /** Needs attention: ink is running out or the absorber is full. */
  alarm: boolean;
  /** Fills up (absorber) or is consumed (ink). */
  fills: boolean;
}

const numberOr = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

export function readMarker(
  state: string,
  attributes: MarkerAttributes,
  /** A custom threshold for consumable ink, if the config sets one. */
  lowOverride?: number
): MarkerReading | undefined {
  const value = Number(state);
  if (!Number.isFinite(value)) return undefined;

  const high = numberOr(attributes.marker_high_level, 100);
  const low = numberOr(attributes.marker_low_level, 0);
  const fills = String(attributes.marker_type ?? "").includes("waste");

  const fill = high > 0 ? Math.max(0, Math.min(100, (value / high) * 100)) : 0;

  const alarm = fills
    ? value >= high
    : value <= (lowOverride ?? low);

  return { fill, alarm, fills };
}
