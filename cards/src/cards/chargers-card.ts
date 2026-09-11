import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCardEditor } from "../core/types";
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
    }

    ha-card {
      padding: var(--ha-space-3, 12px) var(--ha-space-4, 16px);
      background: var(--ha-card-background, var(--card-background-color, white));
      border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
      box-shadow: var(--ha-card-box-shadow, none);
      border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
      box-sizing: border-box;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-bottom: 12px;
      margin-bottom: 4px;
      border-bottom: 1px solid var(--divider-color, rgba(128, 128, 128, 0.15));
    }

    .header-icon {
      color: var(--primary-color);
      --mdc-icon-size: 22px;
      display: flex;
      align-items: center;
    }

    .header-title {
      font-size: var(--ha-font-size-m, 16px);
      font-weight: 600;
      color: var(--primary-text-color);
      flex: 1;
    }

    .header-badge {
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
      background: var(--secondary-background-color, rgba(128, 128, 128, 0.1));
      padding: 2px 8px;
      border-radius: var(--ha-border-radius-pill, 9999px);
      font-weight: 500;
    }

    .chargers-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 8px;
    }

    .charger-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 10px;
      border-radius: var(--ha-border-radius-md, 8px);
      background: var(--secondary-background-color, rgba(128, 128, 128, 0.04));
      border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.08));
      transition: background-color 0.2s ease;
    }

    .charger-item:hover {
      background: var(--state-hover-color, rgba(128, 128, 128, 0.08));
    }

    .row-top {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }

    .socket-icon {
      width: 38px;
      height: 38px;
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
      gap: 2px;
    }

    .primary-line {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      overflow: hidden;
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
      padding: 2px 7px;
      border-radius: 6px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
      gap: 6px;
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
    }

    .dot-sep {
      opacity: 0.6;
    }

    .power-val {
      font-weight: 600;
      color: var(--primary-text-color);
      font-variant-numeric: tabular-nums;
    }

    .row-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .btn-100 {
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 12px;
      border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.25));
      background: var(--card-background-color, white);
      color: var(--primary-text-color);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-100:hover {
      background: var(--warning-color, #ffa600);
      color: white;
      border-color: transparent;
    }

    .btn-100.active {
      background: var(--warning-color, #ffa600);
      color: white;
      border-color: transparent;
    }

    .battery-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 4px;
      border-top: 1px dashed var(--divider-color, rgba(128, 128, 128, 0.12));
    }

    .battery-bar-wrap {
      position: relative;
      height: 7px;
      background: var(--bar-track, rgba(128, 128, 128, 0.18));
      border-radius: 9999px;
      overflow: visible;
    }

    .battery-bar-fill {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      border-radius: 9999px;
      transition: width 0.4s ease-in-out;
    }

    .battery-bar-limit {
      position: absolute;
      top: -2px;
      bottom: -2px;
      width: 2px;
      background: var(--primary-text-color);
      opacity: 0.7;
      border-radius: 1px;
      z-index: 2;
    }

    .battery-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: var(--secondary-text-color);
    }

    .battery-meta .pct {
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .empty-state {
      padding: 16px;
      text-align: center;
      color: var(--secondary-text-color);
      font-size: var(--ha-font-size-s, 13px);
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
      title: "Умная зарядка",
      chargers: [],
    };
  }

  public setConfig(config: ChargersCardConfig): void {
    this._config = config;
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
    if (c.connectedDevice?.toLowerCase().includes("watch") || c.connectedDevice?.toLowerCase().includes("часы")) {
      devIcon = "mdi:watch";
    } else if (c.connectedDevice?.toLowerCase().includes("tablet") || c.connectedDevice?.toLowerCase().includes("планшет")) {
      devIcon = "mdi:tablet";
    }

    const targetEntity = c.statusEntity ?? c.switchEntity;

    return html`
      <div class="charger-item">
        <div
          class="row-top"
          @click=${() => this._openMoreInfo(targetEntity)}
        >
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
              <span>${stateText}</span>
              <span class="dot-sep">·</span>
              <span class="power-val">${c.powerW.toFixed(c.powerW >= 10 ? 0 : 1)} W</span>
            </div>
          </div>

          <div class="row-actions">
            <button
              class="btn-100 ${c.state === "manual_100" ? "active" : ""}"
              title="${t(this.hass, "charger.force_100")}"
              @click=${(e: Event) => this._handleForce100(e, c)}
            >
              100%
            </button>
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

        ${c.batteryLevel !== null
          ? html`
              <div class="battery-row">
                <div class="battery-bar-wrap">
                  <span
                    class="battery-bar-fill"
                    style="width: ${c.batteryLevel}%; background-color: ${batteryColor(c.batteryLevel)};"
                  ></span>
                  ${c.maxCharge
                    ? html`
                        <span
                          class="battery-bar-limit"
                          style="left: ${c.maxCharge}%;"
                          title="Target limit: ${c.maxCharge}%"
                        ></span>
                      `
                    : nothing}
                </div>
                <div class="battery-meta">
                  <span>${c.connectedDevice}</span>
                  <span class="pct">
                    ${Math.round(c.batteryLevel)}%
                    ${c.maxCharge ? ` / ${c.maxCharge}%` : ""}
                  </span>
                </div>
              </div>
            `
          : nothing}
      </div>
    `;
  }
}

registerCard("horos-chargers-card", HorosChargersCard, {
  type: "horos-chargers-card",
  name: { ru: "Список умных зарядок", en: "Smart chargers list" },
  description: {
    ru: "Список всех розеток зарядки с отображением подключенных устройств и уровней заряда",
    en: "List of all charging sockets showing connected devices and battery levels",
  },
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "horos-chargers-card": HorosChargersCard;
  }
}
