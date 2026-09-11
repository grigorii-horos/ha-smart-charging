import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCardEditor } from "../core/types";
import { ensureFeaturesEditor } from "../core/ha-internals";
import { languageOf } from "../core/i18n";

export interface SchemaItem {
  name: string;
  required?: boolean;
  selector?: Record<string, unknown>;
  /** An expandable group or a grid — the same as in the stock tile's editor. */
  type?: string;
  flatten?: boolean;
  icon?: string;
  schema?: SchemaItem[];
  /**
   * Ties a form field to the card's entity. Without it the action editor does not
   * know what the action applies to and does not fill the entity into more-info,
   * toggle and service targets.
   */
  context?: Record<string, string>;
}

/**
 * The shared base of the GUI editors: the form is built from a schema instead of
 * being written by hand. Every card role gets its own filtered ha-entity-picker.
 */
/**
 * The minimal form: schema, labels, ha-form. Used by the grid cards, which have
 * neither tile roles nor features.
 */
export abstract class FormCardEditor
  extends LitElement
  implements LovelaceCardEditor
{
  /*
   * The editor's own geometry, ported from HA's `config-elements-style` and the
   * stock tile editor. Without it the sections do not line up: an ha-form leaves
   * no room under itself, so a panel appended after it sits tight against the
   * last section while the sections inside are 24px apart; an h3 header keeps
   * its browser margins and weight; and the leading icon stays at full contrast
   * where HA's is secondary text colour.
   */
  static styles = css`
    ha-form {
      display: block;
      margin-bottom: var(--ha-space-6, 24px);
    }

    ha-expansion-panel {
      display: block;
      --expansion-panel-content-padding: 0;
      border-radius: var(--ha-border-radius-md, 12px);
      --ha-card-border-radius: var(--ha-border-radius-md, 12px);
    }

    ha-expansion-panel .content {
      padding: var(--ha-space-3, 12px);
    }

    ha-expansion-panel > *[slot="header"] {
      margin: 0;
      font-size: inherit;
      font-weight: inherit;
    }

    ha-expansion-panel ha-icon,
    ha-expansion-panel ha-svg-icon {
      color: var(--secondary-text-color);
    }

    /* The features position selector sits inside the panel, not after it. */
    .features-form {
      margin-top: var(--ha-space-6, 24px);
      margin-bottom: 0;
    }
  `;

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() protected _config?: Record<string, unknown>;

  protected abstract get schema(): SchemaItem[];

  protected abstract get labels(): Record<string, string>;

  public setConfig(config: Record<string, unknown>): void {
    this._config = config;
  }

  /** What to show the form. The config itself by default. */
  protected get formData(): Record<string, unknown> {
    return this._config ?? {};
  }

  /** What to put into the config from the form. */
  protected fromForm(data: Record<string, unknown>): Record<string, unknown> {
    return data;
  }

  /**
   * Labels in the user's language. They are kept as a pair right next to the card
   * rather than in a shared dictionary: the same field is called differently on
   * different cards — "Battery", "Sensor battery", "Main device battery".
   */
  protected pick(dicts: {
    ru: Record<string, string>;
    en: Record<string, string>;
  }): Record<string, string> {
    return languageOf(this.hass) === "ru" ? dicts.ru : dicts.en;
  }

  /** Helper text under fields. The stock tile has one under colour. */
  protected _computeHelper = (item: SchemaItem): string | undefined =>
    item.name === "color"
      ? this.pick({
          ru: {
            color:
              "Неактивное состояние (например, off или closed) окрашено не будет.",
          },
          en: {
            color:
              "Inactive state (for example, off or closed) will not be coloured.",
          },
        }).color
      : undefined;

  protected _computeLabel = (item: SchemaItem): string =>
    this.labels[item.name] ??
    this.pick({ ru: COMMON_LABELS_RU, en: COMMON_LABELS_EN })[item.name] ??
    item.name;

  protected fireConfigChanged(config: Record<string, unknown>): void {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected _valueChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    this.fireConfigChanged(
      this.fromForm(ev.detail.value as Record<string, unknown>)
    );
  }

  protected renderForm() {
    if (!this.hass || !this._config) return nothing;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.formData}
        .schema=${this.schema}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  protected render() {
    return this.renderForm();
  }
}

export abstract class BaseCardEditor extends FormCardEditor {
  @state() private _featuresEditorReady = false;

  /**
   * The name of the config field holding the main entity. Cards assembled from a
   * list of equal entities have none — then features are not offered: there is
   * nothing to address them to.
   */
  protected abstract get entityField(): string | undefined;

  public connectedCallback(): void {
    super.connectedCallback();
    ensureFeaturesEditor().then((ready) => {
      this._featuresEditorReady = ready;
    });
  }

  /**
   * The form shows the layout as pictures (content_layout) while the config holds
   * a boolean vertical — exactly as in the stock tile's editor.
   */
  protected override get formData(): Record<string, unknown> {
    const { vertical, ...rest } = this._config ?? {};
    return {
      ...rest,
      content_layout: vertical ? "vertical" : "horizontal",
    };
  }

  /**
   * What the card puts under the line when the config says nothing about it.
   * The editor shows those as the current list — that is what makes them
   * switchable: a card's own controls are removed the same way a stock feature
   * is, and there is no second switch for them anywhere else.
   */
  protected defaultFeatures(): Record<string, unknown>[] {
    return [];
  }

  private _featuresChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    // Unlike the stock tile, an emptied list is kept rather than deleted: here
    // the absence of the key means "the card's own features", so deleting it
    // would bring back exactly what the user just removed.
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: {
          config: { ...this._config, features: ev.detail.features },
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * A feature with settings of its own — a gauge's bounds, the list of modes —
   * is edited in a sub-view of the card dialog. The dialog opens it in response
   * to `edit-sub-element`; without this the pencil on a feature does nothing.
   */
  private _editFeature(ev: CustomEvent): void {
    ev.stopPropagation();
    const index = ev.detail.subElementConfig?.index as number | undefined;
    if (index === undefined) return;
    const features = (this._config?.features ??
      this.defaultFeatures()) as Record<string, unknown>[];
    this.dispatchEvent(
      new CustomEvent("edit-sub-element", {
        detail: {
          type: "feature",
          config: features[index],
          context: { entity_id: this.featuresEntity },
          saveConfig: (updated: Record<string, unknown>) => {
            const next = [...features];
            next[index] = updated;
            this.dispatchEvent(
              new CustomEvent("config-changed", {
                detail: { config: { ...this._config, features: next } },
                bubbles: true,
                composed: true,
              })
            );
          },
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override fromForm(
    data: Record<string, unknown>
  ): Record<string, unknown> {
    const { content_layout, ...rest } = data;
    const config: Record<string, unknown> = { ...rest };
    if (content_layout === "vertical") config.vertical = true;
    return config;
  }

  /** The features section repeats the markup of the stock tile's editor. */
  /**
   * The entity the features act on. Usually the card's main one; a card built
   * from a list of equal entities has to name one itself, or the panel has
   * nothing to address the features to and stays hidden.
   */
  protected get featuresEntity(): string | undefined {
    return this.entityField
      ? (this._config?.[this.entityField] as string | undefined)
      : undefined;
  }

  private _renderFeatures() {
    const entityId = this.featuresEntity;
    if (!entityId) return nothing;

    // Without a list of its own the card shows the features it would put there
    // itself, so they can be removed here like any other feature.
    const features = (this._config?.features ??
      this.defaultFeatures()) as unknown[];
    const labels = this.pick({ ru: COMMON_LABELS_RU, en: COMMON_LABELS_EN });

    /*
     * The position selector belongs to Home Assistant, so it is taken whole:
     * the two option boxes, their descriptions and the two illustrations the
     * stock tile shows. The strings come from HA's own dictionary — that is
     * what keeps them identical to the tile's and translated wherever HA is;
     * ours are a fallback for an HA old enough to lack the keys.
     */
    const fallback = this.pick({
      ru: {
        bottom: "Снизу",
        bottom_description: "Все features друг под другом",
        inline: "В строке",
        inline_description:
          "Features в две колонки, начиная со строки с названием",
        helper_vertical:
          "При вертикальном содержимом всегда отображаются снизу",
      },
      en: {
        bottom: "Bottom",
        bottom_description: "Displays all features stacked",
        inline: "Inline",
        inline_description:
          "Displays features in two columns, starting next to the name",
        helper_vertical:
          "Always displayed at the bottom if the content layout is vertical",
      },
    });
    const tr = (key: string, alt: string): string =>
      this.hass?.localize(`ui.panel.lovelace.editor.card.tile.${key}`) || alt;

    // Inline has no meaning with a vertical layout: HA greys the box out and
    // says why, rather than letting a value be picked that the card ignores.
    const vertical = Boolean(this._config?.vertical);
    // Nothing chosen reads as an empty pair of radio buttons, so the default
    // the card actually uses is filled in, exactly as the stock editor does.
    const data = {
      ...this._config,
      features_position: vertical
        ? "bottom"
        : ((this._config?.features_position as string | undefined) ?? "bottom"),
    };

    return html`
      <ha-expansion-panel outlined>
        <ha-icon slot="leading-icon" icon="mdi:list-box"></ha-icon>
        <h3 slot="header">${labels.features}</h3>
        <div class="content">
          <hui-card-features-editor
            .hass=${this.hass}
            .context=${{ entity_id: entityId }}
            .features=${features}
            @features-changed=${this._featuresChanged}
            @edit-detail-element=${this._editFeature}
          ></hui-card-features-editor>
          ${features.length
            ? html`
                <ha-form
                  class="features-form"
                  .hass=${this.hass}
                  .data=${data}
                  .schema=${[
                    {
                      name: "features_position",
                      required: true,
                      selector: {
                        select: {
                          mode: "box",
                          options: (["bottom", "inline"] as const).map(
                            (value) => ({
                              value,
                              label: tr(
                                `features_position_options.${value}`,
                                fallback[value]
                              ),
                              description: tr(
                                `features_position_options.${value}_description`,
                                fallback[`${value}_description`]
                              ),
                              image: {
                                src: `/static/images/form/tile_features_position_${value}.svg`,
                                src_dark: `/static/images/form/tile_features_position_${value}_dark.svg`,
                                flip_rtl: true,
                              },
                              disabled: vertical && value === "inline",
                            })
                          ),
                        },
                      },
                    },
                  ]}
                  .computeLabel=${this._computeLabel}
                  .computeHelper=${() =>
                    vertical
                      ? tr(
                          "features_position_helper_vertical",
                          fallback.helper_vertical
                        )
                      : undefined}
                  @value-changed=${this._valueChanged}
                ></ha-form>
              `
            : nothing}
        </div>
      </ha-expansion-panel>
    `;
  }

  protected override render() {
    if (!this.hass || !this._config) return nothing;
    return html`
      ${this.renderForm()}
      ${this._featuresEditorReady ? this._renderFeatures() : nothing}
    `;
  }
}

/**
 * The "Appearance" and "Interactions" sections are shared by every card, with the
 * same field names, selectors and contexts as in the stock tile's editor.
 *
 * `entityField` is the name of the config field holding the card's main entity.
 * On the stock tile that is `entity`; here it is a role: `switch`, `moisture`.
 */
export const contentSection = (
  /**
   * The field with the main entity. Some cards have none at all — batteries,
   * presence and safety are assembled from a list of equal entities — and then
   * the name is typed as plain text and there is nothing to suggest to the icon.
   */
  entityField: string | undefined,
  language: string,
  /** Our own extension of the section: what to pull out large on the right. */
  extra: SchemaItem[] = []
): SchemaItem => ({
  name: "content",
  type: "expandable",
  flatten: true,
  icon: "mdi:text-short",
  schema: [
    entityField
      ? {
          name: "name",
          selector: { entity_name: {} },
          context: { entity: entityField },
        }
      : { name: "name", selector: { text: {} } },
    {
      name: "",
      type: "grid",
      schema: [
        {
          name: "icon",
          selector: { icon: {} },
          ...(entityField ? { context: { icon_entity: entityField } } : {}),
        },
        {
          name: "color",
          // include_state is mandatory: without it the value "state" counts as
          // invalid and the field is highlighted as an error.
          selector: { ui_color: { default_color: "state", include_state: true } },
        },
        { name: "show_entity_picture", selector: { boolean: {} } },
        { name: "hide_state", selector: { boolean: {} } },
      ],
    },
    ...(entityField
      ? [
          {
            name: "state_content",
            selector: { ui_state_content: { allow_context: true } },
            context: { filter_entity: entityField },
          },
          { name: "time_format", selector: { ui_time_format: {} } },
        ]
      : []),
    {
      name: "content_layout",
      required: true,
      selector: {
        select: {
          mode: "box",
          options: [
            {
              value: "horizontal",
              label: language === "ru" ? "Горизонтальная" : "Horizontal",
              image: {
                src: "/static/images/form/tile_content_layout_horizontal.svg",
                src_dark:
                  "/static/images/form/tile_content_layout_horizontal_dark.svg",
                flip_rtl: true,
              },
            },
            {
              value: "vertical",
              label: language === "ru" ? "Вертикальная" : "Vertical",
              image: {
                src: "/static/images/form/tile_content_layout_vertical.svg",
                src_dark:
                  "/static/images/form/tile_content_layout_vertical_dark.svg",
                flip_rtl: true,
              },
            },
          ],
        },
      },
    },
    ...extra,
  ],
});

const actionContext = (entityField: string | undefined) =>
  entityField ? { entity_id: entityField, area_id: "area" } : undefined;

export const interactionsSection = (
  entityField: string | undefined,
  defaultIconAction: string
): SchemaItem => ({
  name: "interactions",
  type: "expandable",
  flatten: true,
  icon: "mdi:gesture-tap",
  schema: [
    {
      name: "tap_action",
      selector: { ui_action: { default_action: "more-info" } },
      context: actionContext(entityField),
    },
    { name: "", type: "divider" },
    {
      name: "icon_tap_action",
      selector: { ui_action: { default_action: defaultIconAction } },
      context: actionContext(entityField),
    },
    {
      name: "",
      type: "optional_actions",
      flatten: true,
      schema: [
        "hold_action",
        "icon_hold_action",
        "double_tap_action",
        "icon_double_tap_action",
      ].map((name) => ({
        name,
        selector: { ui_action: { default_action: "none" } },
        context: actionContext(entityField),
      })),
    },
  ],
});

export const COMMON_LABELS_RU: Record<string, string> = {
  content: "Содержимое",
  state_content: "Что показывать про сущность",
  time_format: "Формат времени",
  interactions: "Взаимодействия",
  icon: "Иконка",
  color: "Цвет",
  content_layout: "Раскладка",
  show_entity_picture: "Показывать картинку сущности",
  hide_state: "Скрыть состояние",
  features: "Features",
  features_position: "Расположение features",
  tap_action: "Тап по карточке",
  hold_action: "Долгое нажатие на карточку",
  double_tap_action: "Двойной тап по карточке",
  icon_tap_action: "Тап по иконке",
  icon_hold_action: "Долгое нажатие на иконку",
  icon_double_tap_action: "Двойной тап по иконке",
};

export const COMMON_LABELS_EN: Record<string, string> = {
  content: "Content",
  state_content: "State content",
  time_format: "Time format",
  interactions: "Interactions",
  icon: "Icon",
  color: "Colour",
  content_layout: "Layout",
  show_entity_picture: "Show entity picture",
  hide_state: "Hide state",
  features: "Features",
  features_position: "Features position",
  tap_action: "Tap on card",
  hold_action: "Hold on card",
  double_tap_action: "Double tap on card",
  icon_tap_action: "Tap on icon",
  icon_hold_action: "Hold on icon",
  icon_double_tap_action: "Double tap on icon",
};

/** The former name: default labels for whatever is not translated yet. */
export const COMMON_LABELS = COMMON_LABELS_RU;

/** An entity selector narrowed down to a domain and a device class. */
export const entitySelector = (
  domain: string,
  deviceClass?: string
): Record<string, unknown> => ({
  entity: {
    filter: deviceClass ? { domain, device_class: deviceClass } : { domain },
  },
});

export const numberSelector = (
  min: number,
  max: number,
  unit?: string
): Record<string, unknown> => ({
  number: { min, max, mode: "box", unit_of_measurement: unit },
});

export const textSelector: Record<string, unknown> = { text: {} };

/**
 * Picking the roles for the right-hand column. The options come as a pair of
 * languages: HA does not translate labels inside a selector, these are our own.
 */
export const bigValuesSelector = (
  options: { value: string; label: string }[]
): Record<string, unknown> => ({
  select: { multiple: true, mode: "list", options },
});

export const booleanSelector: Record<string, unknown> = { boolean: {} };
