/**
 * Weather: the condition dictionary and the arithmetic behind a forecast row.
 *
 * Home Assistant's own `data/weather` is not published, so the two things a
 * card needs from it are mirrored here by the very same names: the condition →
 * icon map and the condition → colour. Neither is invented — the colours are
 * HA's own `--state-weather-*` tokens, so a rainy day is the same blue here as
 * on the stock weather card and follows the user's theme.
 */
import { cssVariableChain, slugify } from "./state-color";
import type { HassEntity } from "./types";

/** HA's fifteen weather conditions. */
export const WEATHER_ICON: Record<string, string> = {
  "clear-night": "mdi:weather-night",
  cloudy: "mdi:weather-cloudy",
  exceptional: "mdi:alert-circle-outline",
  fog: "mdi:weather-fog",
  hail: "mdi:weather-hail",
  lightning: "mdi:weather-lightning",
  "lightning-rainy": "mdi:weather-lightning-rainy",
  partlycloudy: "mdi:weather-partly-cloudy",
  pouring: "mdi:weather-pouring",
  rainy: "mdi:weather-rainy",
  snowy: "mdi:weather-snowy",
  "snowy-rainy": "mdi:weather-snowy-rainy",
  sunny: "mdi:weather-sunny",
  windy: "mdi:weather-windy",
  "windy-variant": "mdi:weather-windy-variant",
};

/** The domain icon HA falls back to when it does not know the condition. */
export const WEATHER_FALLBACK_ICON = "mdi:weather-partly-cloudy";

export function weatherIcon(condition: string | undefined): string {
  return (condition && WEATHER_ICON[condition]) || WEATHER_FALLBACK_ICON;
}

/**
 * The colour of a condition, by the same variable chain `stateColorCss` builds
 * for a live entity. A forecast day has no entity to ask, but it has the same
 * conditions, and they deserve the same colours.
 */
export function weatherColor(condition: string | undefined): string {
  if (!condition) return "var(--state-inactive-color)";
  return (
    cssVariableChain([
      `--state-weather-${slugify(condition)}-color`,
      "--state-weather-active-color",
      "--state-active-color",
    ]) ?? "var(--state-icon-color)"
  );
}

/** The icons naming a weather attribute, mirroring HA's `weatherAttrIcons`. */
export const WEATHER_ATTR_ICONS: Record<string, string> = {
  temperature: "mdi:thermometer",
  apparent_temperature: "mdi:thermometer",
  dew_point: "mdi:thermometer-water",
  humidity: "mdi:water-percent",
  pressure: "mdi:gauge",
  wind_speed: "mdi:weather-windy",
  cloud_coverage: "mdi:weather-cloudy",
  uv_index: "mdi:sun-wireless",
  visibility: "mdi:weather-fog",
  precipitation: "mdi:weather-rainy",
  precipitation_probability: "mdi:weather-rainy",
};

/** What the card can pull out large on the right, and offer on its line. */
export const WEATHER_ATTRIBUTES = [
  "temperature",
  "apparent_temperature",
  "dew_point",
  "humidity",
  "pressure",
  "wind_speed",
  "cloud_coverage",
  "uv_index",
  "visibility",
] as const;

export type WeatherAttribute = (typeof WEATHER_ATTRIBUTES)[number];

/**
 * Which of the entity's own `*_unit` attributes carries the unit of a value.
 *
 * A weather entity does not have `unit_of_measurement`: every quantity brings
 * its own unit, and the unit is needed to show it smaller than the number.
 */
const UNIT_ATTRIBUTE: Record<string, string> = {
  temperature: "temperature_unit",
  templow: "temperature_unit",
  apparent_temperature: "temperature_unit",
  dew_point: "temperature_unit",
  pressure: "pressure_unit",
  wind_speed: "wind_speed_unit",
  wind_gust_speed: "wind_speed_unit",
  visibility: "visibility_unit",
  precipitation: "precipitation_unit",
};

/** Quantities that are already a share of a hundred. */
const PERCENT_ATTRIBUTES = new Set([
  "humidity",
  "cloud_coverage",
  "precipitation_probability",
]);

export function weatherUnit(
  stateObj: HassEntity | undefined,
  attribute: string
): string | undefined {
  if (PERCENT_ATTRIBUTES.has(attribute)) return "%";
  const key = UNIT_ATTRIBUTE[attribute];
  if (!key) return undefined;
  const unit = stateObj?.attributes[key];
  return typeof unit === "string" ? unit : undefined;
}

/** HA's `WeatherEntityFeature.FORECAST_DAILY`. */
const FORECAST_DAILY = 1;

/**
 * Whether the integration behind the entity has a daily forecast at all.
 *
 * Some have only an hourly one, and a few have none: subscribing then returns
 * nothing for ever, and the card would sit with an empty half and no reason
 * given.
 */
export function supportsDailyForecast(
  stateObj: HassEntity | undefined
): boolean {
  const features = Number(stateObj?.attributes.supported_features) || 0;
  return (features & FORECAST_DAILY) !== 0;
}

/** One day of a daily forecast, as HA sends it. */
export interface ForecastDay {
  datetime: string;
  condition?: string;
  temperature?: number;
  templow?: number;
  precipitation?: number;
  precipitation_probability?: number;
  humidity?: number;
  wind_speed?: number;
}

/** What a row's bar can be. */
export const WEATHER_BARS = [
  "temperature",
  "precipitation",
  "precipitation_probability",
  "humidity",
  "wind_speed",
] as const;

export type WeatherBar = (typeof WEATHER_BARS)[number];

export interface ForecastBar {
  /** Where the fill starts, 0..100. Only a temperature span sets it. */
  from?: number;
  /** Where it ends, 0..100. */
  level: number;
  /** The night, when the day has one. */
  low?: number;
  /** The reading the row is about: the afternoon, the rain, the wind. */
  high?: number;
}

const num = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

/**
 * The bars of a week.
 *
 * Temperature is a span, not a level: a day is the stretch between its night
 * and its afternoon, and every day is drawn against the same scale — the whole
 * week's coldest night to its warmest afternoon. That is the one thing a week
 * of numbers is bad at and a row of bars is good at: which days stand out.
 *
 * Everything else is a level. A share of a hundred — the chance of rain, the
 * humidity — is drawn against a hundred. Rain and wind have no ceiling of
 * their own, so they are drawn against the largest the week holds; a week
 * without a drop stays empty rather than pretending some day was the wettest.
 */
export function forecastBars(
  days: ForecastDay[],
  bar: WeatherBar
): ForecastBar[] {
  if (bar === "temperature") return temperatureBars(days);

  const values = days.map((day) => num(day[bar]));
  const known = values.filter((value): value is number => value !== undefined);
  const top = PERCENT_ATTRIBUTES.has(bar)
    ? 100
    : known.length
      ? Math.max(...known)
      : 0;

  return values.map((value) => {
    if (value === undefined) return { level: 0 };
    if (top <= 0) return { level: 0, high: value };
    return { level: Math.min(100, (value / top) * 100), high: value };
  });
}

function temperatureBars(days: ForecastDay[]): ForecastBar[] {
  const highs = days.map((day) => num(day.temperature));
  const lows = days.map((day, index) => num(day.templow) ?? highs[index]);
  const known = [...highs, ...lows].filter(
    (value): value is number => value !== undefined
  );
  if (!known.length) return days.map(() => ({ level: 0 }));

  const min = Math.min(...known);
  const max = Math.max(...known);
  const span = max - min;

  return days.map((_, index) => {
    const high = highs[index];
    const low = lows[index];
    // A day the forecast says nothing about gets an empty bar, not a full one.
    if (high === undefined || low === undefined) return { level: 0 };
    // A week that never changed temperature is a full bar on every row: there
    // is nothing to compare, and an empty one would read as no data.
    if (span <= 0) return { from: 0, level: 100, low, high };
    return {
      from: ((low - min) / span) * 100,
      level: ((high - min) / span) * 100,
      low,
      high,
    };
  });
}
