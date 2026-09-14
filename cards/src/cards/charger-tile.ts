import { css, html, nothing } from "lit";
import { state } from "lit/decorators.js";
import { BaseTileCard, type TileBaseConfig } from "../core/base-tile-card";
import { tileStyles } from "../core/tile-styles";
import { renderLevels, levelStyles, type LevelRow } from "../core/levels";
import { composeSegments } from "../core/format";
import { batteryColor } from "../core/labels";
import type { LovelaceCardEditor } from "../core/types";
import { registerCard } from "../core/register";
import { t } from "../core/i18n";

export interface ChargerTileConfig extends TileBaseConfig {
  type: string;
  /** Status entity from smart_charger integration (e.g. sensor.livingroom_charger_status) */
  entity?: string;
  /** Underlying switch entity (e.g. switch.device_plug_livingroom) */
  switch?: string;
  /** Power sensor entity (e.g. sensor.device_plug_livingroom_power) */
  power?: string;
  /** Device name override */
  device_name?: string;
  /** Force 100% button entity */
  force_100_button?: string;
}

export class HorosChargerTile extends BaseTileCard {
  static styles = [
    tileStyles,
    levelStyles,
    css`
      .quick-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-top: 6px;
      }
      .action-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: var(--ha-border-radius-pill, 9999px);
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.2));
        color: var(--primary-text-color);
        font-size: var(--ha-font-size-s, 12px);
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease, border-color 0.2s ease;
      }
      .action-chip:hover {
        background: var(--state-hover-color, rgba(128, 128, 128, 0.15));
      }
      .action-chip.active {
        background: var(--warning-color, #ffa600);
        color: #fff;
        border-color: transparent;
      }
      .action-chip ha-icon {
        --mdc-icon-size: 14px;
      }
    `,
  ];

  @state() private _config?: ChargerTileConfig;

  protected override contentRows(): number {
    return this.levelRows(1) + this.fixedRows();
  }

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("../editors/charger-tile-editor");
    return document.createElement(
      "horos-charger-tile-editor"
    ) as LovelaceCardEditor;
  }

  public static getStubConfig(): Partial<ChargerTileConfig> {
    return {
      entity: "",
      switch: "",
      power: "",
    };
  }

  public setConfig(config: ChargerTileConfig): void {
    if (!config.entity && !config.switch) {
      throw new Error("Either entity or switch is required");
    }
    this.base = config;
    this._config = config;
  }

  private _getChargerData() {
    if (!this._config || !this.hass) return null;
    const config = this._config;

    let state = "idle";
    let powerW = 0.0;
    let connectedDevice: string | null = null;
    let batteryLevel: number | null = null;
    let minCharge: number | null = null;
    let maxCharge: number | null = null;
    let isProbing = false;
    let switchEntity: string | undefined = config.switch;
    const mainEntityId = config.entity || config.switch;

    if (config.entity && this.hass.states[config.entity]) {
      const statusObj = this.hass.states[config.entity];
      if (statusObj) {
        state = statusObj.state;
        const attrs = statusObj.attributes as Record<string, any>;
        powerW = Number(attrs.power_w) || 0.0;
        connectedDevice = attrs.connected_device ? String(attrs.connected_device) : null;
        batteryLevel = attrs.battery_level !== undefined && attrs.battery_level !== null ? Number(attrs.battery_level) : null;
        minCharge = attrs.min_charge !== undefined && attrs.min_charge !== null ? Number(attrs.min_charge) : null;
        maxCharge = attrs.max_charge !== undefined && attrs.max_charge !== null ? Number(attrs.max_charge) : null;
        isProbing = Boolean(attrs.is_probing);
        if (!switchEntity && attrs.switch_entity) {
          switchEntity = String(attrs.switch_entity);
        }
      }
    } else if (config.switch && this.hass.states[config.switch]) {
      const swObj = this.hass.states[config.switch];
      const isSwOn = swObj ? swObj.state === "on" : false;
      if (config.power && this.hass.states[config.power]) {
        const pObj = this.hass.states[config.power];
        powerW = pObj ? parseFloat(pObj.state) || 0.0 : 0.0;
      }
      state = !isSwOn ? "idle" : powerW > 2.5 ? "charging" : "generic";
    }

    if (config.device_name) {
      connectedDevice = config.device_name;
    }

    return {
      state,
      powerW,
      connectedDevice,
      batteryLevel,
      minCharge,
      maxCharge,
      isProbing,
      switchEntity,
      mainEntityId,
    };
  }

  private async _handleForce100(e: Event) {
    e.stopPropagation();
    if (!this.hass || !this._config) return;
    const data = this._getChargerData();
    if (!data) return;

    if (this._config.force_100_button) {
      await this.hass.callService("button", "press", {
        entity_id: this._config.force_100_button,
      });
      return;
    }

    if (this.hass.services?.smart_charger?.force_100) {
      await this.hass.callService("smart_charger", "force_100", {
        charger_id: data.switchEntity,
      });
      return;
    }

    if (data.switchEntity) {
      await this.hass.callService("switch", "turn_on", {
        entity_id: data.switchEntity,
      });
    }
  }

  private async _handleStop(e: Event) {
    e.stopPropagation();
    if (!this.hass || !this._config) return;
    const data = this._getChargerData();
    if (!data) return;

    if (this.hass.services?.smart_charger?.stop) {
      await this.hass.callService("smart_charger", "stop", {
        charger_id: data.switchEntity,
      });
      return;
    }

    if (data.switchEntity) {
      await this.hass.callService("switch", "turn_off", {
        entity_id: data.switchEntity,
      });
    }
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    const config = this._config;
    const data = this._getChargerData();
    if (!data) return nothing;

    const {
      state,
      powerW,
      connectedDevice,
      batteryLevel,
      minCharge,
      maxCharge,
      isProbing,
      switchEntity,
      mainEntityId,
    } = data;

    // Color and Icon selection
    let icon = "mdi:power-plug-outline";
    let color = "var(--state-inactive-color, #7b7b7b)";

    if (state === "charging") {
      icon = "mdi:battery-charging";
      color = "var(--success-color, #43a047)";
    } else if (state === "manual_100") {
      icon = "mdi:battery-charging-100";
      color = "var(--warning-color, #ffa600)";
    } else if (state === "cooldown" || state === "sleep") {
      icon = "mdi:battery-clock";
      color = "var(--info-color, #0288d1)";
    } else if (state === "generic") {
      icon = "mdi:power-plug";
      color = "var(--accent-color, #7e57c2)";
    }

    const stateLabel = t(this.hass, `charger.${state}`);

    // Secondary text composition
    const secondaryPieces: string[] = [];
    if (isProbing) {
      secondaryPieces.push(t(this.hass, "charger.probing"));
    } else if (connectedDevice) {
      secondaryPieces.push(connectedDevice);
      secondaryPieces.push(stateLabel);
    } else if (state !== "idle") {
      secondaryPieces.push(stateLabel);
    } else {
      secondaryPieces.push(t(this.hass, "charger.idle"));
    }

    // Level progress rows
    const rows: LevelRow[] = [];
    if (connectedDevice && batteryLevel !== null) {
      const targetText = maxCharge
        ? `${Math.round(batteryLevel)}% / ${maxCharge}%`
        : `${Math.round(batteryLevel)}%`;

      rows.push({
        entityId: mainEntityId ?? "",
        name: connectedDevice,
        text: targetText,
        ink: batteryColor(batteryLevel),
        level: batteryLevel,
        icon: state === "charging" ? "mdi:battery-charging" : "mdi:battery",
        alarm: minCharge !== null ? batteryLevel < minCharge : batteryLevel < 20,
      });
    }

    // Custom features: level row + quick action button
    const customFeaturesTemplate = html`
      ${rows.length
        ? renderLevels(rows, (id) => this.fireMoreInfo(id))
        : nothing}
      <div class="quick-actions">
        <button
          class="action-chip ${state === "manual_100" ? "active" : ""}"
          @click=${this._handleForce100}
        >
          <ha-icon icon="mdi:battery-charging-100"></ha-icon>
          ${t(this.hass, "charger.force_100")}
        </button>
        ${state !== "idle"
          ? html`
              <button class="action-chip" @click=${this._handleStop}>
                <ha-icon icon="mdi:stop"></ha-icon>
                ${t(this.hass, "charger.stop")}
              </button>
            `
          : nothing}
      </div>
    `;

    return this.renderTile({
      icon,
      color,
      primary:
        config.name ??
        (switchEntity && this.hass.states[switchEntity]?.attributes.friendly_name) ??
        t(this.hass, "charger.title"),
      mainEntityId,
      secondary: composeSegments(
        secondaryPieces.map((p) => ({ text: p }))
      ),
      values: [
        {
          value: `${powerW.toFixed(powerW >= 10 ? 0 : 1)} W`,
          icon: "mdi:flash",
          entityId: config.power ?? switchEntity,
        },
        ...(batteryLevel !== null
          ? [
              {
                value: `${Math.round(batteryLevel)}%`,
                icon: "mdi:battery",
                entityId: mainEntityId,
              },
            ]
          : []),
      ],
      customFeatures: customFeaturesTemplate,
    });
  }
}

registerCard("horos-charger-tile", HorosChargerTile, {
  type: "horos-charger-tile",
  name: "Smart charger (tile)",
  description:
    "Smart charging socket: connected device, power draw and battery level",
  preview: true,
});

declare global {
  interface HTMLElementTagNameMap {
    "horos-charger-tile": HorosChargerTile;
  }
}
