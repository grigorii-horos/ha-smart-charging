/**
 * How a list of features is laid out — the same arithmetic Home Assistant does
 * in `computeCardFeatureLayout`.
 *
 * It matters because it is not one block: with `features_position: inline` the
 * first feature moves up into the tile's own row and the rest pair up into two
 * columns underneath. A card that renders the whole list in one place looks
 * nothing like the stock tile with the same config.
 */
export type FeaturePosition = "bottom" | "inline";

export type Feature = Record<string, unknown>;

export interface FeatureLayout {
  /** What goes next to the icon and the texts. Never more than one. */
  inline: Feature[];
  /** What goes under the line. */
  below: Feature[];
  /** Columns the block below fills: two once something went inline. */
  columns: number;
}

/** How many features share a row below when one of them went inline. */
const INLINE_COLUMNS = 2;

export function featureLayout(
  features: Feature[] | undefined,
  position: FeaturePosition
): FeatureLayout {
  const list = features ?? [];
  if (position !== "inline") {
    return { inline: [], below: list, columns: 1 };
  }
  const below = list.slice(1);
  return {
    inline: list.slice(0, 1),
    below,
    columns: Math.min(below.length, INLINE_COLUMNS),
  };
}

/** Layout rows the block below takes: a row per feature, two per row inline. */
export function featureRowCount(layout: FeatureLayout): number {
  return Math.ceil(layout.below.length / Math.max(layout.columns, 1));
}
