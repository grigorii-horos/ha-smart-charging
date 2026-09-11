/**
 * Soil moisture thresholds. A separate DOM-free module so the logic can be
 * tested without bringing up a browser environment.
 */

export const DEFAULT_DRY_BELOW = 30;
export const DEFAULT_WET_ABOVE = 70;

export type MoistureStatus = "dry" | "ok" | "wet" | "unknown";

/** The bounds count as normal: exactly at the threshold a plant is not dry yet. */
export function moistureStatus(
  value: number | undefined,
  dryBelow: number,
  wetAbove: number
): MoistureStatus {
  if (value === undefined) return "unknown";
  if (value < dryBelow) return "dry";
  if (value > wetAbove) return "wet";
  return "ok";
}

/** Colours come from the theme's semantic tokens; we don't invent our own. */
export const MOISTURE_COLOR: Record<MoistureStatus, string> = {
  dry: "var(--warning-color)",
  ok: "var(--success-color)",
  wet: "var(--info-color)",
  unknown: "var(--state-inactive-color)",
};

export const MOISTURE_ICON: Record<MoistureStatus, string> = {
  dry: "mdi:water-off",
  ok: "mdi:sprout",
  wet: "mdi:water-alert",
  unknown: "mdi:sprout",
};
