import {
  LitElement,
  html,
  nothing,
  type CSSResultGroup,
  type TemplateResult,
} from "lit";
import { property, state } from "lit/decorators.js";
import { tileStyles } from "./tile-styles";
import type {
  HomeAssistant,
  HassEntity,
  LovelaceGridOptions,
} from "./types";
import {
  SECONDARY_SEPARATOR,
  UNAVAILABLE_STATES,
  impossibleValue,
  roleSegment,
  splitValueUnit,
  type ResolvedRole,
  type Segment,
} from "./format";
import type { KeyedRole } from "./big-values";
import {
  handleAction,
  hasAction,
  type ActionConfig,
  type ActionType,
} from "./actions";
import { featureLayout, featureRowCount, type Feature } from "./features";
import { ensureTileInternals } from "./ha-internals";
import { ROLE_ICONS } from "./role-icons";
import { stateActive } from "./state-color";
import { t } from "./i18n";

export interface FormattedValue {
  value: string;
  unit?: string;
  /** Whose value it is: a tap on it opens more-info for that entity. */
  entityId?: string;
  /**
   * The value icon. "63%" on its own could be humidity, battery or disk space —
   * the icon names it without spending room on a word.
   */
  icon?: string;
}

export type FeaturesPosition = "bottom" | "inline";

/** Config fields shared by every card — the same names as the stock tile's. */
export interface TileBaseConfig {
  name?: string;
  icon?: string;
  color?: string;
  vertical?: boolean;
  hide_state?: boolean;
  show_entity_picture?: boolean;
  /**
   * What to show about the main entity: state, an attribute, last changed.
   * Exactly the stock tile's field, rendered by the very same HA component —
   * `state-display`.
   */
  state_content?: string | string[];
  /** How to render time values. */
  time_format?: string;
  /**
   * The card's own line under the tile — level rows, controls of its own. On by
   * default; set it to false and the card is its main line and nothing else.
   * The stock `features` are a separate list and are added and removed in the
   * editor's Features panel.
   */
  levels?: boolean;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  icon_tap_action?: ActionConfig;
  icon_hold_action?: ActionConfig;
  icon_double_tap_action?: ActionConfig;
  features?: Record<string, unknown>[];
  features_position?: FeaturesPosition;
  /**
   * The dashboard's own layout options, as the sections view writes them into
   * the card config. The card reads one thing from them: whether its height was
   * fixed by hand or left to the content.
   */
  grid_options?: { rows?: number | "auto"; columns?: number | "full" };
}

export interface TileParts {
  icon: string;
  /** A CSS colour for --tile-color; undefined leaves it neutral. */
  color?: string;
  primary: string;
  secondary?: Segment[];
  /** The main entity: the card's actions apply to it. */
  mainEntityId?: string;
  imageUrl?: string;
  /** The default icon action, used when icon_tap_action is not set. */
  defaultIconAction?: ActionConfig;
  values?: FormattedValue[];
  /**
   * The card's own features — a moisture gauge on a plant, for example. They
   * work until the user sets their own: their list replaces ours entirely.
   */
  ownFeatures?: Record<string, unknown>[];
  /**
   * Our own features line, for when the stock one is not enough. It takes the
   * same place and the same height as the tile's features row.
   */
  customFeatures?: TemplateResult;
}

/**
 * The shared skeleton of every card.
 *
 * The markup is not ours: a card is assembled from the stock HA tile's
 * components. `ha-tile-container` gives the body, ripple, gesture recognition,
 * the hold indicator and the focus ring; `ha-tile-icon` and `ha-tile-info` the
 * icon and the texts; `hui-card-features` the features row.
 *
 * The only things of our own are what the tile does not have: the right-hand
 * column of large values and a separate tap target per value.
 */
export abstract class BaseTileCard extends LitElement {
  // An array, not a single CSSResult: subclasses append their own styles to it.
  static styles: CSSResultGroup = [tileStyles];

  @property({ attribute: false }) public hass?: HomeAssistant;

  /**
   * Where the dashboard put the card. Home Assistant sets it; the tile uses it
   * for one thing — a card in a grid with a height of its own reserves a fixed
   * height for the info block so neighbouring tiles line up.
   */
  @property({ attribute: false }) public layout?: string;

  /** HA components load asynchronously, hence the re-render. */
  @state() private _ready = false;

  /** The shared config fields. A subclass must put them here in setConfig. */
  protected base: TileBaseConfig = {};

  private _entityId?: string;

  private _defaultIconAction?: ActionConfig;

  /**
   * How much room the content below the line takes, in layout rows: level rows,
   * features, controls of our own. A subclass overrides this if it has any.
   */
  protected contentRows(): number {
    return this.fixedRows();
  }

  /**
   * Layout rows for a list of level rows: three of them fit in one, and none of
   * them are there at all when the card's own line is switched off.
   *
   * Three, not two, because that is what a level row actually measures. A
   * layout row gives the content under the line 64px (56 of row plus the 8 of
   * gap it swallows); a row is a 12px line of text and an 8px bar — 14px — and
   * with a 4px gap between them and the stock 12px of padding under the last
   * one three come to 62. Counting two per row asked the grid for a whole
   * spare row and the card then stood in a hole a third of its height.
   */
  protected levelRows(count: number): number {
    if (this.base.levels === false) return 0;
    return Math.ceil(count / 3);
  }

  /**
   * The part of that content which cannot be squeezed.
   *
   * A list of level rows lives with whatever height it is given — it spreads or
   * crowds. A row of buttons or a slider is 42px and stays 42px, so a card that
   * has one must not be allowed to shrink under it. This is what `min_rows`
   * reports, and it is why the two numbers are counted separately.
   */
  protected fixedRows(): number {
    return this.featureRows([]);
  }

  /**
   * Rows taken by the features line, counted the way the stock tile counts
   * them. The user's list wins over the card's own, exactly as it does in
   * render, and the layout arithmetic is HA's own.
   */
  protected featureRows(own: Feature[]): number {
    const features = this.base.features ?? own;
    if (!features.length) return 0;
    return featureRowCount(
      featureLayout(features, this.base.features_position ?? "bottom")
    );
  }

  public getCardSize(): number {
    return 1 + this.contentRows();
  }

  /**
   * Layout hints for a sections dashboard.
   *
   * `rows: "auto"` because the height depends on the content: a printer has five
   * ink rows, a climate card none. The stock cards with a floating height, entities
   * and heading, describe themselves the same way. Without it the card would claim
   * one row no matter what is in it.
   */
  public getGridOptions(): LovelaceGridOptions {
    return {
      columns: 6,
      rows: "auto",
      min_columns: this.base.vertical ? 3 : 6,
      // One row for the line plus whatever cannot be squeezed under it.
      min_rows: 1 + this.fixedRows(),
    };
  }

  public connectedCallback(): void {
    super.connectedCallback();
    ensureTileInternals().then((ready) => {
      this._ready = ready;
    });
  }

  protected fireMoreInfo(entityId: string): void {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      })
    );
  }

  // ---- actions ---------------------------------------------------------

  private _handleAction(ev: CustomEvent): void {
    this._runAction(ev.detail.action as ActionType, false);
  }

  private _handleIconAction(ev: CustomEvent): void {
    ev.stopPropagation();
    this._runAction(ev.detail.action as ActionType, true);
  }

  private _runAction(action: ActionType, fromIcon: boolean): void {
    if (!this.hass) return;
    const config = fromIcon
      ? {
          entity: this._entityId,
          tap_action: this.base.icon_tap_action ?? this._defaultIconAction,
          hold_action: this.base.icon_hold_action,
          double_tap_action: this.base.icon_double_tap_action,
        }
      : {
          entity: this._entityId,
          tap_action: this.base.tap_action,
          hold_action: this.base.hold_action,
          double_tap_action: this.base.double_tap_action,
        };
    handleAction(this, this.hass, config, action);
  }

  // ---- rendering -------------------------------------------------------

  /** A banner instead of the card: the config is invalid or the entity is gone. */
  protected renderWarning(message: string): TemplateResult {
    return html`<ha-card><div class="warning">${message}</div></ha-card>`;
  }

  /**
   * The main entity's state for the secondary line.
   *
   * When `state_content` or `time_format` is set, the stock `state-display` does
   * the rendering: it handles attributes, last changed and time formats — no
   * reason to redo that by hand.
   */
  protected mainStateSegment(
    role: ResolvedRole | undefined,
    /**
     * What the line says when the config says nothing. A card whose entity
     * keeps everything in attributes needs one — a weather entity's own state
     * is the word "partlycloudy" and nothing else.
     */
    defaultContent?: string | string[]
  ): Segment | undefined {
    if (!role?.stateObj || role.unavailable) return undefined;
    const content = this.base.state_content ?? defaultContent;
    if (!content && !this.base.time_format) {
      return roleSegment(this.hass, role);
    }
    return {
      entityId: role.entityId,
      content: html`<state-display
        .hass=${this.hass}
        .stateObj=${role.stateObj}
        .content=${content}
        .timeFormat=${this.base.time_format}
      ></state-display>`,
    };
  }

  /** A message about entities that were not found, or undefined if all are there. */
  protected missingRolesWarning(
    roles: (ResolvedRole | undefined)[]
  ): string | undefined {
    const missing = roles
      .filter((role): role is ResolvedRole => !!role && role.missing)
      .map((role) => role.entityId);
    if (!missing.length) return undefined;
    return t(
      this.hass,
      missing.length === 1 ? "entity.missing.one" : "entity.missing.many",
      { list: missing.join(", ") }
    );
  }

  /**
   * Wraps a value in its own tap target. The click does not bubble to the body,
   * so more-info opens for that entity rather than for the main one.
   *
   * A button rather than a span with a handler: values are targets in their own
   * right, and one has to be able to tab to them and press them from the
   * keyboard. The entity name goes into title and aria-label: "63%" on its own
   * says nothing about whose it is — neither on hover nor to a screen reader.
   */
  protected renderClickable(
    content: unknown,
    entityId: string | undefined
  ): TemplateResult {
    if (!entityId) return html`<span>${content}</span>`;
    const name =
      this.hass?.states[entityId]?.attributes.friendly_name ?? entityId;
    return html`<button
      class="clickable"
      title=${name}
      aria-label=${name}
      @click=${(ev: Event) => {
        ev.stopPropagation();
        this.fireMoreInfo(entityId);
      }}
      >${content}</button
    >`;
  }

  protected renderTile(parts: TileParts): TemplateResult {
    const {
      icon,
      color,
      primary,
      secondary,
      mainEntityId,
      imageUrl,
      defaultIconAction,
      values,
      ownFeatures,
      customFeatures,
    } = parts;

    this._entityId = mainEntityId;
    this._defaultIconAction = defaultIconAction;

    if (!this._ready) {
      return this.renderWarning(t(this.hass, "internals.failed"));
    }

    const tileColor = this._tileColor(color);

    const iconAction = this.base.icon_tap_action ?? defaultIconAction;
    const hasIconAction =
      hasAction(iconAction) ||
      hasAction(this.base.icon_hold_action) ||
      hasAction(this.base.icon_double_tap_action);

    // The user's list replaces the card's own — including when they emptied it:
    // the editor shows the card's own features as the current list, so removing
    // the last one there means "none", not "back to the defaults".
    const features = this.base.features ?? ownFeatures;
    const position: FeaturesPosition = this.base.features_position ?? "bottom";
    // The card's own line under the tile, unless the config turned it off.
    const own = this.base.levels === false ? undefined : customFeatures;
    // The features are split the way the stock tile splits them: with `inline`
    // the first one moves up into the tile's row and the rest pair up below.
    const layout = featureLayout(features, position);

    // A card fills its slot only when the height was fixed by hand and there is
    // something under the line to fill it with; see the note by :host([filled]).
    const fixedHeight = typeof this.base.grid_options?.rows === "number";
    this.toggleAttribute(
      "filled",
      fixedHeight && Boolean(own || layout.below.length)
    );

    return html`
      <ha-card style="--tile-color: ${tileColor};">
        <ha-tile-container
          .featurePosition=${position}
          .vertical=${Boolean(this.base.vertical)}
          .fixedInfoHeight=${this.layout === "grid" && fixedHeight}
          .interactive=${true}
          .actionHandlerOptions=${{
            hasHold: hasAction(this.base.hold_action),
            hasDoubleClick: hasAction(this.base.double_tap_action),
          }}
          @action=${this._handleAction}
        >
          <ha-tile-icon
            slot="icon"
            class=${imageUrl ? "image" : ""}
            .interactive=${hasIconAction}
            .imageUrl=${imageUrl}
            .icon=${this.base.icon ?? icon}
            .actionHandlerOptions=${{
              hasHold: hasAction(this.base.icon_hold_action),
              hasDoubleClick: hasAction(this.base.icon_double_tap_action),
            }}
            @action=${this._handleIconAction}
          ></ha-tile-icon>

          <div slot="info" class="info ${this.base.vertical ? "vertical" : ""}">
            <ha-tile-info>
              <span slot="primary">${primary}</span>
              ${secondary?.length && !this.base.hide_state
                ? html`<span slot="secondary"
                    >${secondary.map(
                      (segment, index) => html`
                        ${index
                          ? html`<span>${SECONDARY_SEPARATOR}</span>`
                          : nothing}${this.renderClickable(
                          segment.content ?? segment.text,
                          segment.entityId
                        )}
                      `
                    )}</span
                  >`
                : nothing}
            </ha-tile-info>
            ${values?.length
              ? html`<div class="values of-${values.length}">
                  ${values.map(
                    (item, index) => html`
                      ${index
                        ? html`<span class="values-separator">/</span>`
                        : nothing}
                      ${this.renderClickable(
                        html`${item.icon
                          ? html`<ha-icon
                              class="value-icon"
                              .icon=${item.icon}
                            ></ha-icon>`
                          : nothing}${item.value}${item.unit
                          ? html`<span class="unit"> ${item.unit}</span>`
                          : nothing}`,
                        item.entityId
                      )}
                    `
                  )}
                </div>`
              : nothing}
          </div>

          ${layout.inline.length
            ? html`<hui-card-features
                slot="features-inline"
                .hass=${this.hass}
                .context=${{ entity_id: mainEntityId }}
                .color=${this.base.color}
                .features=${layout.inline}
                .position=${position}
              ></hui-card-features>`
            : nothing}
          ${own
            ? html`<div slot="features" class="custom-features">
                ${own}
              </div>`
            : nothing}
          ${layout.below.length
            ? html`<hui-card-features
                slot="features"
                .columns=${layout.columns}
                .hass=${this.hass}
                .context=${{ entity_id: mainEntityId }}
                .color=${this.base.color}
                .features=${layout.below}
                .position=${"bottom"}
              ></hui-card-features>`
            : nothing}
        </ha-tile-container>
      </ha-card>
    `;
  }

  /**
   * The tile colour, by the stock tile's rule: a colour from the config counts
   * only while the entity is active — an inactive one is grey on the stock tile
   * and has to be grey here. A card assembled from a list of equal entities has
   * nothing to be active, so there its colour is taken at face value.
   */
  private _tileColor(fallback?: string): string {
    const stateObj = this._entityId
      ? this.hass?.states[this._entityId]
      : undefined;
    if (this.base.color && (!stateObj || stateActive(stateObj))) {
      return cssColor(this.base.color);
    }
    return fallback ?? "var(--state-inactive-color)";
  }

  /**
   * The values of the right-hand column. `icons` names a value by its role key:
   * without it two percentages in a row are indistinguishable.
   */
  protected bigValues(
    big: KeyedRole[],
    icons: Record<string, string> = ROLE_ICONS
  ): FormattedValue[] {
    return big
      .map((item): FormattedValue | undefined => {
        const formatted = this.formatted(item.role?.stateObj);
        return formatted
          ? {
              ...formatted,
              entityId: item.role?.entityId,
              icon: icons[item.key],
            }
          : undefined;
      })
      .filter((value): value is FormattedValue => !!value);
  }

  /**
   * The entity picture URL — the same logic as _getImageUrl in the stock tile.
   * Cameras, with their separate size-aware URL, are not supported.
   */
  protected entityImage(stateObj: HassEntity | undefined): string | undefined {
    if (!this.base.show_entity_picture || !this.hass || !stateObj) {
      return undefined;
    }
    const picture =
      (stateObj.attributes.entity_picture_local as string | undefined) ||
      (stateObj.attributes.entity_picture as string | undefined);
    return picture ? this.hass.hassUrl(picture) : undefined;
  }

  /** A large value ready to show. An unavailable entity has none. */
  protected formatted(
    stateObj: HassEntity | undefined
  ): FormattedValue | undefined {
    if (!this.hass || !stateObj) return undefined;
    if (UNAVAILABLE_STATES.has(stateObj.state)) return undefined;
    // A number the quantity cannot take is a sensor saying it has no reading;
    // large and in bold is the last place that belongs.
    if (impossibleValue(stateObj)) return undefined;
    return splitValueUnit(
      this.hass.formatEntityState(stateObj),
      stateObj.attributes.unit_of_measurement
    );
  }
}

/** A colour from the config: an HA palette name, "primary" or a ready CSS colour. */
export function cssColor(color: string): string {
  if (/^(#|rgb|hsl|var\()/.test(color)) return color;
  if (color === "state") return "var(--state-icon-color)";
  return `var(--${color}-color, var(--state-icon-color))`;
}
