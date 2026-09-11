/**
 * The minimal slice of HA frontend types that we need. The full ones live in
 * home-assistant/frontend and are not published, so we describe them here —
 * only what is actually used.
 */

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    device_class?: string;
    unit_of_measurement?: string;
    icon?: string;
    [key: string]: unknown;
  };
}

export interface HomeAssistant {
  states: Record<string, HassEntity | undefined>;
  localize: (key: string, ...args: unknown[]) => string;
  formatEntityState: (stateObj: HassEntity, state?: string) => string;
  /**
   * An attribute rendered with its own unit and the user's locale — a climate
   * target temperature, say. Optional: it appeared later than the rest.
   */
  formatEntityAttributeValue?: (
    stateObj: HassEntity,
    attribute: string,
    value?: unknown
  ) => string;
  /** An absolute URL from an HA relative path — needed for entity pictures. */
  hassUrl: (path?: string) => string;
  /** The entity registry: needed to tell which device an entity belongs to. */
  entities?: Record<
    string,
    { device_id?: string; area_id?: string; hidden?: boolean }
  >;
  /** The device registry: names for grouping, areas for placing. */
  devices?: Record<
    string,
    { name?: string; name_by_user?: string; area_id?: string }
  >;
  /** The user's interface language. */
  language?: string;
  locale?: { language?: string };
  services?: Record<string, Record<string, unknown>>;
  callService: (
    domain: string,
    service: string,
    data?: Record<string, unknown>
  ) => Promise<unknown>;
  /**
   * The websocket. Needed by the one thing that is not in the state machine:
   * a weather forecast, which HA stopped putting into attributes and now only
   * streams to whoever subscribes.
   */
  connection?: {
    subscribeMessage: <T>(
      callback: (message: T) => void,
      subscribeMessage: Record<string, unknown>
    ) => Promise<() => Promise<void>>;
  };
}

/** A role in the card layout: which entity fills which slot with which meaning. */
export interface Role {
  /** The role key in the config, "humidity" for example. */
  key: string;
  /** The entity_id from the config, if the role is filled. */
  entityId?: string;
}

export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: Record<string, unknown>): void;
}

/**
 * What a card offers for an entity in the "Add to dashboard" dialog. HA renders
 * `config` as a live preview and adds it as it is when the user picks it.
 */
export interface CardSuggestion {
  label?: string;
  config: Record<string, unknown> & { type: string };
}

export interface CustomCardEntry {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
  documentationURL?: string;
  getEntitySuggestion?: (
    hass: HomeAssistant,
    entityId: string
  ) => CardSuggestion | CardSuggestion[] | null;
}

declare global {
  interface Window {
    customCards?: CustomCardEntry[];
  }

  interface HASSDomEvents {
    "hass-more-info": { entityId: string };
    "config-changed": { config: Record<string, unknown> };
  }
}

/** What HA lays a card out with on a sections dashboard. */
export interface LovelaceGridOptions {
  columns?: number | "full";
  rows?: number | "auto";
  min_columns?: number;
  min_rows?: number;
  max_columns?: number;
  max_rows?: number;
}
