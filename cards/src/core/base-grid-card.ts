import { LitElement, html, nothing, css, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceGridOptions } from "./types";

interface CardHelpers {
  createCardElement: (config: Record<string, unknown>) => HTMLElement;
}

interface ChildCard extends HTMLElement {
  hass?: HomeAssistant;
  setConfig?: (config: Record<string, unknown>) => void;
}

/**
 * The skeleton for "heading plus grid" cards.
 *
 * It draws nothing itself: the heading is the stock `heading` card, the cells
 * are stock HA cards (`tile`, `button`). We only decide what goes into the grid
 * and pick sane defaults, so that a dozen cards in the config collapse into one
 * block.
 */
export abstract class BaseGridCard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .heading {
      margin-bottom: var(--ha-space-2, 8px);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(var(--columns, 2), minmax(0, 1fr));
      gap: var(--ha-space-2, 8px);
    }

    .warning {
      display: block;
      padding: var(--ha-space-3, 12px);
      color: var(--warning-color, #ffa600);
      font-size: var(--ha-font-size-m, 14px);
    }
  `;

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _heading?: ChildCard;

  @state() private _children: ChildCard[] = [];

  @state() protected _error?: string;

  /** Config of the stock `heading` card, or undefined if no heading is needed. */
  protected abstract headingConfig(): Record<string, unknown> | undefined;

  /** Configs of the stock cards the grid is made of. */
  protected abstract childConfigs(): Record<string, unknown>[];

  protected abstract columns(): number;

  public getCardSize(): number {
    const rows = Math.ceil(this._children.length / Math.max(1, this.columns()));
    return 1 + rows;
  }

  /** Height depends on the number of cells, so HA computes it itself. */
  public getGridOptions(): LovelaceGridOptions {
    return { columns: 12, rows: "auto", min_columns: 6, min_rows: 2 };
  }

  /** A subclass must call this at the end of setConfig. */
  protected rebuild(): void {
    void this._build();
  }

  private async _build(): Promise<void> {
    const loader = (
      window as unknown as { loadCardHelpers?: () => Promise<CardHelpers> }
    ).loadCardHelpers;
    if (!loader) {
      this._error = "Home Assistant did not provide card helpers";
      return;
    }

    const helpers = await loader();

    const headingConfig = this.headingConfig();
    this._heading = headingConfig
      ? (helpers.createCardElement(headingConfig) as ChildCard)
      : undefined;

    this._children = this.childConfigs().map(
      (config) => helpers.createCardElement(config) as ChildCard
    );

    this._passHass();
  }

  private _passHass(): void {
    if (!this.hass) return;
    if (this._heading) this._heading.hass = this.hass;
    for (const child of this._children) child.hass = this.hass;
  }

  protected updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has("hass")) this._passHass();
  }

  protected render(): TemplateResult | typeof nothing {
    if (this._error) {
      return html`<ha-card><div class="warning">${this._error}</div></ha-card>`;
    }
    if (!this._children.length) return nothing;

    return html`
      ${this._heading
        ? html`<div class="heading">${this._heading}</div>`
        : nothing}
      <div class="grid" style="--columns: ${this.columns()}">
        ${this._children}
      </div>
    `;
  }
}
