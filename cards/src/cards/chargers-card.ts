import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type {
  HomeAssistant,
  LovelaceCardEditor,
  LovelaceGridOptions,
} from "../core/types";
import { registerCard } from "../core/register";
import { batteryColor } from "../core/labels";
import { t } from "../core/i18n";

export interface ChargerConfigItem {
  entity?: string;
  switch?: string;
  power?: string;
  name?: string;
  device_name?: string;
}

export interface ChargersCardConfig {
  type: string;
  title?: string;
  chargers?: (string | ChargerConfigItem)[];
  grid_options?: LovelaceGridOptions;
}

interface ResolvedCharger {
  id: string;
  name: string;
  state: string;
  powerW: number;
  connectedDevice: string | null;
  batteryLevel: number | null;
  minCharge: number | null;
  maxCharge: number | null;
  isProbing: boolean;
  switchEntity: string | null;
  statusEntity: string | null;
  isSwitchOn: boolean;
}

export class HorosChargersCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      --ha-card-border-radius: var(--ha-border-radius-lg, 12px);
    }

    :host([filled]) {
      height: 100%;
    }

    ha-card {
      height: 100%;
      background: var(--ha-card-background, var(--card-background-color, white));
      border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
      box-shadow: var(--ha-card-box-shadow, none);
      border: var(--ha-card-border-width, 1px) solid
        var(--ha-card-border-color, var(--divider-color, #e0e0e0));
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;
    }

    .card-header {
      height: 64px;
      min-height: 64px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
      border-bottom: 1px solid
        var(--divider-color, rgba(128, 128, 128, 0.12));
      background: transparent;
      flex-shrink: 0;
    }

    :host([filled]) .card-header {
      flex: 1 1 0;
      height: auto;
    }

    .header-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--ha-border-radius-pill, 9999px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(
        --secondary-background-color,
        rgba(128, 128, 128, 0.1)
      );
      color: var(--primary-color);
      flex-shrink: 0;
    }

    .header-icon ha-icon {
      --mdc-icon-size: 20px;
    }

    .header-title {
      font-size: var(--ha-font-size-m, 16px);
      font-weight: 600;
      color: var(--primary-text-color);
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .header-badge {
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
      background: var(
        --secondary-background-color,
        rgba(128, 128, 128, 0.1)
      );
      padding: 3px 10px;
      border-radius: var(--ha-border-radius-pill, 9999px);
      font-weight: 500;
      flex-shrink: 0;
    }

    .chargers-list {
      display: contents;
    }

    .charger-item {
      min-height: 64px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 7px 16px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      background: transparent;
      flex-shrink: 0;
    }

    :host([filled]) .charger-item {
      flex: 1 1 0;
      height: auto;
    }

    .charger-main-row {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .charger-item:hover {
      background: var(--state-hover-color, rgba(128, 128, 128, 0.05));
    }

    .charger-item:not(:last-child) {
      border-bottom: 1px solid
        var(--divider-color, rgba(128, 128, 128, 0.08));
    }

    .socket-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--ha-border-radius-pill, 9999px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--icon-bg, rgba(128, 128, 128, 0.12));
      color: var(--icon-color, var(--secondary-text-color));
      flex-shrink: 0;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .socket-icon ha-icon {
      --mdc-icon-size: 20px;
    }

    .socket-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
    }

    .primary-line {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      overflow: hidden;
      line-height: 18px;
    }

    .socket-name {
      font-size: var(--ha-font-size-m, 14px);
      font-weight: 500;
      color: var(--primary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .device-pill {
      font-size: 11px;
      line-height: 14px;
      padding: 1px 6px;
      border-radius: 6px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .device-pill.charging {
      background: rgba(67, 160, 71, 0.15);
      color: var(--success-color, #43a047);
    }

    .device-pill.manual_100 {
      background: rgba(255, 166, 0, 0.15);
      color: var(--warning-color, #ffa600);
    }

    .device-pill.cooldown,
    .device-pill.sleep {
      background: rgba(2, 136, 209, 0.15);
      color: var(--info-color, #0288d1);
    }

    .device-pill.generic {
      background: rgba(126, 87, 194, 0.15);
      color: var(--accent-color, #7e57c2);
    }

    .device-pill.idle {
      background: var(--divider-color, rgba(128, 128, 128, 0.1));
      color: var(--secondary-text-color);
    }

    .secondary-line {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: var(--ha-font-size-s, 12px);
      line-height: 16px;
      color: var(--secondary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .state-text {
      flex-shrink: 0;
    }

    .dot-sep {
      opacity: 0.5;
      flex-shrink: 0;
    }

    .power-val {
      font-weight: 600;
      color: var(--primary-text-color);
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }

    .battery-summary-val {
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }

    .battery-full-bar-wrap {
      width: 100%;
      position: relative;
      padding: 13px 0;
      box-sizing: border-box;
      margin-top: 2px;
      user-select: none;
    }

    .battery-full-bar-track {
      position: relative;
      width: 100%;
      height: 7px;
      background: var(--divider-color, rgba(128, 128, 128, 0.18));
      border-radius: 9999px;
      overflow: visible;
    }

    .target-range-band {
      position: absolute;
      top: 0;
      bottom: 0;
      background: rgba(3, 169, 244, 0.16);
      border-radius: 3px;
      border-left: 1.5px dashed rgba(3, 169, 244, 0.5);
      border-right: 1.5px dashed rgba(3, 169, 244, 0.5);
      box-sizing: border-box;
      pointer-events: none;
    }

    .battery-full-bar-fill {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      border-radius: 9999px;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }

    .battery-full-bar-fill.charging-anim {
      background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.28) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      background-size: 200% 100%;
      animation: chargeShimmer 2s infinite linear;
    }

    @keyframes chargeShimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    .battery-thumb {
      position: absolute;
      top: 50%;
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: var(--card-background-color, #ffffff);
      border: 2px solid var(--thumb-color, var(--primary-color));
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 3;
      transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .battery-thumb.pulsing {
      animation: thumbPulse 2s infinite ease-in-out;
    }

    @keyframes thumbPulse {
      0%, 100% {
        box-shadow: 0 0 0 2px rgba(67, 160, 71, 0.25);
      }
      50% {
        box-shadow: 0 0 0 5px rgba(67, 160, 71, 0.45);
      }
    }

    .track-tick {
      position: absolute;
      top: -2px;
      bottom: -2px;
      width: 2px;
      border-radius: 1px;
      z-index: 2;
      pointer-events: none;
      transform: translateX(-50%);
    }

    .track-tick.tick-bottom {
      background: var(--info-color, #0288d1);
    }

    .track-tick.tick-top {
      background: var(--primary-text-color);
      opacity: 0.85;
    }

    .cutoff-indicator {
      position: absolute;
      display: flex;
      align-items: center;
      gap: 1px;
      pointer-events: none;
      white-space: nowrap;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    .cutoff-indicator.cutoff-top {
      top: 0;
      flex-direction: column;
    }

    .cutoff-indicator.cutoff-bottom {
      bottom: 0;
      flex-direction: column;
    }

    .cutoff-caret-top {
      width: 0;
      height: 0;
      border-left: 3.5px solid transparent;
      border-right: 3.5px solid transparent;
      border-top: 4px solid var(--primary-text-color);
      opacity: 0.85;
      margin-top: 2px;
      flex-shrink: 0;
    }

    .cutoff-caret-bottom {
      width: 0;
      height: 0;
      border-left: 3.5px solid transparent;
      border-right: 3.5px solid transparent;
      border-bottom: 4px solid var(--info-color, #0288d1);
      margin-bottom: 2px;
      flex-shrink: 0;
    }

    .cutoff-label {
      font-size: 9.5px;
      font-weight: 600;
      letter-spacing: 0.2px;
    }

    .cutoff-top .cutoff-label {
      color: var(--primary-text-color);
      opacity: 0.9;
    }

    .cutoff-bottom .cutoff-label {
      color: var(--info-color, #0288d1);
    }

    .row-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .btn-100 {
      padding: 2px 7px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 10px;
      border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.25));
      background: var(--card-background-color, white);
      color: var(--primary-text-color);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-100:hover,
    .btn-100.active {
      background: var(--warning-color, #ffa600);
      color: white;
      border-color: transparent;
    }

    .empty-state {
      height: 56px;
      min-height: 56px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--secondary-text-color);
      font-size: var(--ha-font-size-s, 13px);
    }

    :host([filled]) .empty-state {
      flex: 1 1 0;
      height: auto;
    }
  `;

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: ChargersCardConfig;

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("../editors/chargers-card-editor");
    return document.createElement(
      "horos-chargers-card-editor"
    ) as LovelaceCardEditor;
  }

  public static getStubConfig(): Partial<ChargersCardConfig> {
    return {
      title: "Smart Charging",
      chargers: [],
    };
  }

  public setConfig(config: ChargersCardConfig): void {
    this._config = config;
  }

  private _chargerCount(): number {
    if (this._config?.chargers && this._config.chargers.length > 0) {
      return this._config.chargers.length;
    }
    const resolved = this._resolveChargers();
    return resolved.length > 0 ? resolved.length : 1;
  }

  public getCardSize(): number {
    return 1 + this._chargerCount();
  }

  public getGridOptions(): LovelaceGridOptions {
    const rows = 1 + this._chargerCount();
    return {
      columns: 12,
      rows: this._config?.grid_options?.rows ?? rows,
      min_rows: rows,
      min_columns: 6,
    };
  }

  private _resolveChargers(): ResolvedCharger[] {
    if (!this.hass) return [];
    const config = this._config;
    const resolved: ResolvedCharger[] = [];

    // 1. If explicit config given
    if (config?.chargers && config.chargers.length > 0) {
      for (const item of config.chargers) {
        const cItem: ChargerConfigItem =
          typeof item === "string" ? { switch: item } : item;

        let statusEntity: string | null = cItem.entity ?? null;
        const switchEntity: string | null = cItem.switch ?? null;
        const powerEntity: string | null = cItem.power ?? null;
        const name = cItem.name;

        // Auto-match status sensor if not set
        if (!statusEntity && switchEntity) {
          const matched = Object.keys(this.hass.states).find(
            (id) =>
              id.startsWith("sensor.") &&
              this.hass!.states[id]?.attributes.switch_entity === switchEntity
          );
          if (matched) statusEntity = matched;
        }

        const r = this._buildResolved(
          statusEntity,
          switchEntity,
          powerEntity,
          name,
          cItem.device_name
        );
        if (r) resolved.push(r);
      }
      return resolved;
    }

    // 2. Auto-discovery: Find all smart_charger status sensors
    const statusEntities = Object.keys(this.hass.states).filter(
      (id) =>
        id.startsWith("sensor.") &&
        this.hass!.states[id]?.attributes.charger_id !== undefined
    );

    if (statusEntities.length > 0) {
      for (const sId of statusEntities) {
        const r = this._buildResolved(sId, null, null, undefined, undefined);
        if (r) resolved.push(r);
      }
      return resolved;
    }

    // 3. Fallback: discover sockets with power meters
    const switches = Object.keys(this.hass.states).filter(
      (id) =>
        id.startsWith("switch.") &&
        (id.includes("plug") || id.includes("charger") || id.includes("socket"))
    );

    for (const sw of switches) {
      const pSensor = Object.keys(this.hass.states).find(
        (id) =>
          id.startsWith("sensor.") &&
          (id.includes(sw.replace("switch.", "")) ||
            id.includes(sw.replace("switch.device_plug_", ""))) &&
          id.endsWith("_power")
      );
      const r = this._buildResolved(null, sw, pSensor ?? null, undefined, undefined);
      if (r) resolved.push(r);
    }

    return resolved;
  }

  private _buildResolved(
    statusEntity: string | null,
    switchEntity: string | null,
    powerEntity: string | null,
    nameOverride?: string,
    deviceOverride?: string
  ): ResolvedCharger | null {
    if (!this.hass) return null;

    let state = "idle";
    let powerW = 0.0;
    let connectedDevice: string | null = deviceOverride ?? null;
    let batteryLevel: number | null = null;
    let minCharge: number | null = null;
    let maxCharge: number | null = null;
    let isProbing = false;
    let isSwitchOn = false;
    let name = nameOverride;

    if (statusEntity && this.hass.states[statusEntity]) {
      const sObj = this.hass.states[statusEntity];
      if (sObj) {
        state = sObj.state;
        const a = sObj.attributes as Record<string, any>;
        powerW = Number(a.power_w) || 0.0;
        connectedDevice = a.connected_device ? String(a.connected_device) : connectedDevice;
        batteryLevel = a.battery_level !== undefined && a.battery_level !== null ? Number(a.battery_level) : null;
        minCharge = a.min_charge !== undefined && a.min_charge !== null ? Number(a.min_charge) : null;
        maxCharge = a.max_charge !== undefined && a.max_charge !== null ? Number(a.max_charge) : null;
        isProbing = Boolean(a.is_probing);
        if (!switchEntity && a.switch_entity) {
          switchEntity = String(a.switch_entity);
        }
        if (!name && a.charger_name) {
          name = String(a.charger_name);
        }
      }
    }

    if (switchEntity && this.hass.states[switchEntity]) {
      const swObj = this.hass.states[switchEntity];
      if (swObj) {
        isSwitchOn = swObj.state === "on";
        if (!name) {
          name = swObj.attributes.friendly_name ?? switchEntity;
        }
      }
      if (!powerEntity && statusEntity === null) {
        // Try to read power sensor
        const inferredPower = Object.keys(this.hass.states).find(
          (id) =>
            id.startsWith("sensor.") &&
            id.includes(switchEntity!.replace("switch.", "")) &&
            id.endsWith("_power")
        );
        if (inferredPower) powerEntity = inferredPower;
      }
    }

    if (powerEntity && this.hass.states[powerEntity] && statusEntity === null) {
      const pObj = this.hass.states[powerEntity];
      powerW = pObj ? parseFloat(pObj.state) || 0.0 : 0.0;
      state = !isSwitchOn ? "idle" : powerW > 2.5 ? "charging" : "generic";
    }

    const id = statusEntity ?? switchEntity ?? "unknown";
    return {
      id,
      name: name ?? id,
      state,
      powerW,
      connectedDevice,
      batteryLevel,
      minCharge,
      maxCharge,
      isProbing,
      switchEntity,
      statusEntity,
      isSwitchOn,
    };
  }

  private _openMoreInfo(entityId: string | null) {
    if (!entityId) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _handleToggleSocket(e: Event, charger: ResolvedCharger) {
    e.stopPropagation();
    if (!this.hass || !charger.switchEntity) return;
    await this.hass.callService("switch", "toggle", {
      entity_id: charger.switchEntity,
    });
  }

  private async _handleForce100(e: Event, charger: ResolvedCharger) {
    e.stopPropagation();
    if (!this.hass) return;

    if (this.hass.services?.smart_charger?.force_100) {
      await this.hass.callService("smart_charger", "force_100", {
        charger_id: charger.switchEntity ?? charger.id,
      });
      return;
    }

    if (charger.switchEntity) {
      await this.hass.callService("switch", "turn_on", {
        entity_id: charger.switchEntity,
      });
    }
  }

  protected render() {
    if (!this.hass) return nothing;
    const chargers = this._resolveChargers();
    const title = this._config?.title ?? t(this.hass, "charger.title");

    const activeCount = chargers.filter(
      (c) => c.state === "charging" || c.state === "manual_100"
    ).length;

    return html`
      <ha-card>
        <div class="card-header">
          <div class="header-icon">
            <ha-icon icon="mdi:battery-charging-wireless"></ha-icon>
          </div>
          <div class="header-title">${title}</div>
          <div class="header-badge">
            ${activeCount > 0
              ? `${activeCount} / ${chargers.length}`
              : t(this.hass, "charger.idle")}
          </div>
        </div>

        ${!chargers.length
          ? html`<div class="empty-state">${t(this.hass, "charger.noChargers")}</div>`
          : html`
              <div class="chargers-list">
                ${chargers.map((c) => this._renderChargerRow(c))}
              </div>
            `}
      </ha-card>
    `;
  }

  private _renderChargerRow(c: ResolvedCharger) {
    let icon = "mdi:power-plug-outline";
    let iconColor = "var(--secondary-text-color)";
    let iconBg = "rgba(128, 128, 128, 0.1)";

    if (c.state === "charging") {
      icon = "mdi:battery-charging";
      iconColor = "var(--success-color, #43a047)";
      iconBg = "rgba(67, 160, 71, 0.15)";
    } else if (c.state === "manual_100") {
      icon = "mdi:battery-charging-100";
      iconColor = "var(--warning-color, #ffa600)";
      iconBg = "rgba(255, 166, 0, 0.15)";
    } else if (c.state === "cooldown" || c.state === "sleep") {
      icon = "mdi:battery-clock";
      iconColor = "var(--info-color, #0288d1)";
      iconBg = "rgba(2, 136, 209, 0.15)";
    } else if (c.state === "generic") {
      icon = "mdi:power-plug";
      iconColor = "var(--accent-color, #7e57c2)";
      iconBg = "rgba(126, 87, 194, 0.15)";
    }

    const stateText = c.isProbing
      ? t(this.hass, "charger.probing")
      : t(this.hass, `charger.${c.state}`);

    // Device icon
    let devIcon = "mdi:cellphone";
    if (c.connectedDevice?.toLowerCase().includes("watch")) {
      devIcon = "mdi:watch";
    } else if (c.connectedDevice?.toLowerCase().includes("tablet")) {
      devIcon = "mdi:tablet";
    }

    const targetEntity = c.statusEntity ?? c.switchEntity;

    return html`
      <div
        class="charger-item"
        @click=${() => this._openMoreInfo(targetEntity)}
      >
        <div class="charger-main-row">
          <div
            class="socket-icon"
            style="--icon-color: ${iconColor}; --icon-bg: ${iconBg};"
          >
            <ha-icon .icon=${icon}></ha-icon>
          </div>

          <div class="socket-info">
            <div class="primary-line">
              <span class="socket-name">${c.name}</span>
              ${c.connectedDevice
                ? html`
                    <span class="device-pill ${c.state}">
                      <ha-icon icon=${devIcon} style="--mdc-icon-size: 13px;"></ha-icon>
                      ${c.connectedDevice}
                    </span>
                  `
                : c.state === "generic"
                ? html`
                    <span class="device-pill generic">
                      ${t(this.hass, "charger.generic")}
                    </span>
                  `
                : html`
                    <span class="device-pill idle">
                      ${t(this.hass, "charger.idle")}
                    </span>
                  `}
            </div>
            <div class="secondary-line">
              <span class="state-text">${stateText}</span>
              ${c.isSwitchOn
                ? html`
                    <span class="dot-sep">·</span>
                    <span class="power-val">${c.powerW.toFixed(c.powerW >= 10 ? 0 : 1)} W</span>
                  `
                : nothing}
              ${c.batteryLevel !== null
                ? html`
                    <span class="dot-sep">·</span>
                    <span
                      class="battery-summary-val"
                      style="color: ${batteryColor(c.batteryLevel)};"
                    >
                      ${Math.round(c.batteryLevel)}%
                    </span>
                  `
                : nothing}
            </div>
          </div>

          <div class="row-actions">
            ${c.isSwitchOn
              ? html`
                  <button
                    class="btn-100 ${c.state === "manual_100" ? "active" : ""}"
                    title="${t(this.hass, "charger.force_100")}"
                    @click=${(e: Event) => this._handleForce100(e, c)}
                  >
                    100%
                  </button>
                `
              : nothing}
            ${c.switchEntity
              ? html`
                  <ha-switch
                    .checked=${c.isSwitchOn}
                    @click=${(e: Event) => e.stopPropagation()}
                    @change=${(e: Event) => this._handleToggleSocket(e, c)}
                  ></ha-switch>
                `
              : nothing}
          </div>
        </div>

        ${this._renderBatteryBar(c)}
      </div>
    `;
  }

  private _renderBatteryBar(c: ResolvedCharger) {
    if (c.batteryLevel === null) return nothing;

    const level = Math.max(0, Math.min(100, c.batteryLevel));
    const minCharge =
      c.minCharge !== null ? Math.max(0, Math.min(100, c.minCharge)) : null;
    const maxCharge =
      c.maxCharge !== null ? Math.max(0, Math.min(100, c.maxCharge)) : null;

    const getTransform = (percent: number) => {
      if (percent <= 6) return "translateX(0%)";
      if (percent >= 94) return "translateX(-100%)";
      return "translateX(-50%)";
    };

    return html`
      <div class="battery-full-bar-wrap">
        ${maxCharge !== null
          ? html`
              <div
                class="cutoff-indicator cutoff-top"
                style="left: ${maxCharge}%; transform: ${getTransform(maxCharge)};"
                title="${t(this.hass, "charger.max_limit", { val: maxCharge })}"
              >
                <span class="cutoff-label">${t(this.hass, "charger.max_limit", { val: maxCharge })}</span>
                <span class="cutoff-caret-top"></span>
              </div>
            `
          : nothing}

        <div class="battery-full-bar-track">
          ${minCharge !== null && maxCharge !== null && maxCharge > minCharge
            ? html`
                <div
                  class="target-range-band"
                  style="left: ${minCharge}%; width: ${maxCharge - minCharge}%;"
                  title="${t(this.hass, "charger.limit", { min: minCharge, max: maxCharge })}"
                ></div>
              `
            : nothing}

          <div
            class="battery-full-bar-fill ${c.state === "charging" ? "charging-anim" : ""}"
            style="width: ${level}%; background-color: ${batteryColor(level)};"
          ></div>

          <div
            class="battery-thumb ${c.state === "charging" ? "pulsing" : ""}"
            style="left: ${level}%; --thumb-color: ${batteryColor(level)};"
          ></div>

          ${minCharge !== null
            ? html`
                <div
                  class="track-tick tick-bottom"
                  style="left: ${minCharge}%;"
                ></div>
              `
            : nothing}

          ${maxCharge !== null
            ? html`
                <div
                  class="track-tick tick-top"
                  style="left: ${maxCharge}%;"
                ></div>
              `
            : nothing}
        </div>

        ${minCharge !== null
          ? html`
              <div
                class="cutoff-indicator cutoff-bottom"
                style="left: ${minCharge}%; transform: ${getTransform(minCharge)};"
                title="${t(this.hass, "charger.min_limit", { val: minCharge })}"
              >
                <span class="cutoff-caret-bottom"></span>
                <span class="cutoff-label">${t(this.hass, "charger.min_limit", { val: minCharge })}</span>
              </div>
            `
          : nothing}
      </div>
    `;
  }
}

registerCard("horos-chargers-card", HorosChargersCard, {
  type: "horos-chargers-card",
  name: "Smart chargers list",
  description:
    "List of all charging sockets showing connected devices and battery levels",
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "horos-chargers-card": HorosChargersCard;
  }
}
