# Smart Charging for Home Assistant

[![HACS: Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz/)
[![Home Assistant 2026.9+](https://img.shields.io/badge/Home%20Assistant-2026.9%2B-41BDF5.svg)](https://www.home-assistant.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An intelligent, battery-preserving smart charging system for Home Assistant:
1. **Backend Integration (`custom_components/smart_charger`)**: An asynchronous state-machine integration that handles power jump detection, automatic device identification via Companion App sensors, dual-limit battery protection (e.g. 70% - 90% or 40% - 75%), probe cycles (15m/30m), hysteresis restarts, and safety cutoffs.
2. **Frontend Lovelace Cards (`ha-smart-charging-card.js`)**: Reusable Lovelace cards built with Lit + TypeScript following the native Home Assistant design system (`ha-tile-container`, `ha-tile-icon`, `ha-tile-info`, `renderLevels`, HA design tokens) to display charging sockets, real-time power draw, connected devices, battery bars, and quick 100% controls.

---

## Key Features

- **Automatic Device Recognition**:
  When a device is connected, the power draw jumps (> 2.5W). After a 15-second grace period, the integration verifies which device transitioned to charging state within a 120-second freshness window.
- **Battery Health Preservation (Dual Limits)**:
  - Configurable minimum and maximum charge thresholds (e.g., 70% min to 90% max for phones/tablets, 40% min to 75% max for smartwatches).
  - Automatically cuts power when upper threshold is reached.
  - Automatically restarts charging if battery drops below lower threshold while plugged in (hysteresis).
- **Periodic Probe Cycles (15m / 30m)**:
  - 15 minutes after stopping, the socket briefly turns on for 12 seconds to probe power draw.
  - If power $\le 1.5$ W, the cable is empty and socket remains off in `idle`.
  - If power $> 1.5$ W and device is still connected, it goes to sleep for 30 minutes before probing again.
- **Force 100% Manual Override**:
  - Physical switch turn-on or quick "100%" card button activates manual 100% charging with a 3-hour safety cutoff.
- **Generic Device Fallback**:
  - Power banks, flashlights, and non-smart devices without HA companion app charge safely without infinite loop.

---

## Lovelace Cards

### 1. `horos-chargers-card` (Overview List Card)
Displays all charging sockets in a single clean overview card with real-time connected device badges, power draw in Watts, battery progress bars with limit markers, and quick 100% / power toggle controls.

```yaml
type: custom:horos-chargers-card
title: Умная зарядка
chargers:
  - switch: switch.device_plug_livingroom
    power: sensor.device_plug_livingroom_power
    name: Розетка в гостиной
  - switch: switch.device_plug_watch
    power: sensor.device_plug_watch_power
    name: Розетка для часов
```

*(If `chargers` is omitted, the card automatically discovers all smart charger sensors and power sockets on your system!)*

### 2. `horos-charger-tile` (Single Socket Tile)
A single tile matching Home Assistant's native Tile card geometry. Shows socket name, connected device, power draw and battery percentage as large values on the right, and a battery level bar underneath.

```yaml
type: custom:horos-charger-tile
entity: sensor.livingroom_charger_status
# or direct entities:
switch: switch.device_plug_livingroom
power: sensor.device_plug_livingroom_power
name: Розетка в гостиной
```

---

## Installation

### Via HACS
1. Open **HACS** → **⋮** (top right) → **Custom repositories**.
2. Paste the repository URL: `https://github.com/grigorii-horos/ha-smart-charging`.
3. Select category: **Integration** (for backend) or **Dashboard** (for frontend).
4. Click **Install**.

### Manual Installation
1. Copy `custom_components/smart_charger/` into your Home Assistant directory under `config/custom_components/smart_charger/`.
2. Copy `dist/ha-smart-charging-card.js` into `config/www/`.
3. In Home Assistant, go to **Settings** → **Dashboards** → **⋮** → **Resources** and add `/local/ha-smart-charging-card.js` as a JavaScript Module.
4. Restart Home Assistant.

---

## Configuration

### UI Configuration (Recommended)
1. Go to **Settings** → **Devices & Services** → **Add Integration**.
2. Search for **Smart Charger**.
3. Select your socket switch and power sensor.
4. Add your devices (phone, watch, tablet) with their respective battery level, battery state, and charger type sensors from the Home Assistant Companion App.

### Development & Publishing
To build the frontend bundle and publish directly to your Home Assistant host:

```bash
# Build frontend
cd cards
npm install
npm run build

# Deploy to live HA host
python3 script/publish.py
```

---

## License

MIT © Grigorii Horos
