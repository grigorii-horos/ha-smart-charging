# AGENTS.md — Agent & Developer Guide

Universal guide for AI agents (Claude Code, Antigravity, Cursor, Codex, Windsurf) and developers working on **`ha-smart-charging`**.

`CLAUDE.md` is a symlink to this file so all agents share the exact same instructions and rules.

---

## 1. Project Overview & Architecture

`ha-smart-charging` is an integrated Home Assistant solution for intelligent battery-preserving charging of mobile devices (phones, tablets, smartwatches) using smart switches/plugs with power metering.

The repository consists of two tightly coupled layers:

```
ha-smart-charging/
  custom_components/smart_charger/  # Backend: async Python Home Assistant integration
  cards/src/                        # Frontend: Lit + TypeScript Lovelace cards
  dist/                             # Committed bundle (HACS and direct dashboard install)
  script/publish.py                 # Build, sync to live host, and invalidate Lovelace cache
```

### Backend (`custom_components/smart_charger/`)
- **Coordinator & State Machine (`coordinator.py`)**:
  - Monitors power draw (Watts) and switch state.
  - Automatically matches connected devices (e.g. Grigorii's Phone, Pixel Watch, iPad) by cross-referencing mobile app battery sensor updates with connection freshness (< 120s) and power jump events.
  - States:
    - `idle`: socket off or no device connected.
    - `probing`: periodic cable test to detect if a device was plugged into an unpowered cable.
    - `charging`: actively charging below target limit.
    - `cooldown`: power disconnected or resting.
    - `sleep`: target charge level reached (`max_charge`, e.g. 85%), socket turned off to protect battery health.
    - `manual_100`: temporary override to charge to 100% (e.g. before travel).
    - `generic`: unrecognised load or non-smart device draw.
  - Hysteresis recharging: automatically turns back on when battery drops below `min_charge` (e.g. 70%) while still connected.
- **Entities**:
  - `sensor.<name>_status`: primary sensor with state and rich attributes (`power_w`, `connected_device`, `battery_level`, `min_charge`, `max_charge`, `is_probing`, `switch_entity`, `charger_name`).
  - `button.<name>_force_100`: service trigger for immediate 100% full charge.
  - `switch.<name>`: wrapped or coordinated switch.
- **Config Flow (`config_flow.py`)**: UI configuration supporting switch selection, power sensor binding, and target charging thresholds.

### Frontend (`cards/`, `dist/`)
- **Cards**:
  - `horos-chargers-card` (`cards/src/cards/chargers-card.ts`): overview card displaying all charging sockets, live battery indicators, power consumption, force 100% button, and toggle switches.
  - `horos-charger-tile` (`cards/src/cards/charger-tile.ts`): individual tile card for a single smart charger.
- **Editors (`cards/src/editors/`)**: visual card editors integrated with Home Assistant UI schemas.
- **Core (`cards/src/core/`)**: shared utilities for i18n, types, HA component wrappers, and state styling.
- **Distribution (`dist/ha-smart-charging-card.js`)**: **committed on purpose** so HACS and manual installations work out of the box without requiring node/build tools on the Home Assistant host.

---

## 2. Hard Invariants & Project Conventions (READ BEFORE EDITING)

### 1. Strict 56px Standard Unit Height
- In Home Assistant Lovelace grids, 1 standard row unit is **56px**.
- **Card header**: exactly **56px** (`height: 56px; min-height: 56px; max-height: 56px; box-sizing: border-box;`).
- **Each charger row**: exactly **56px** (`height: 56px; min-height: 56px; max-height: 56px; box-sizing: border-box;`).
- A card with $N$ chargers takes exactly $1 + N$ standard units of height:
  - 1 charger: $1 + 1 = 2$ units ($2 \times 56\text{px} = 112\text{px}$ + borders).
  - 2 chargers: $1 + 2 = 3$ units ($3 \times 56\text{px} = 168\text{px}$ + borders).
- `getGridOptions().rows` returns `1 + N`.
- In grid sections (`:host([filled])`), use `flex: 1 1 0; height: auto; min-height: 0;` on both header and charger items so that every element takes an equal 1-unit fraction without overflow.
- **Never create stacked rows inside a charger item.** Everything (icon, title, secondary line with battery bar, actions) must live on a single horizontal row (`56px`).

### 2. Inline Full-Width Battery Bar
- In `horos-chargers-card`, the battery bar (`.battery-bar-wrap`) is placed inside `.secondary-line` with `flex: 1 1 0; min-width: 50px; height: 20px;`.
- It dynamically stretches across **100% of all available horizontal space** between the power readout (`0.0 W`) and the battery percentage (`90%`).
- Elements rendered on the track:
  - **Target Range Band**: translucent band between `min_charge` and `max_charge`.
  - **Battery Fill**: fill width proportional to `level%` with level-based color (`batteryColor(level)`).
  - **Thumb Dot**: 10px circular thumb at current level with pulsing animation when charging.
  - **Bottom Cut-off (`min_charge`, e.g. 70%)**: info-blue tick (`.track-tick.tick-bottom`) and upward-pointing triangle caret (`▲`, `.caret-bottom`).
  - **Top Cut-off (`max_charge`, e.g. 90%)**: high-contrast tick (`.track-tick.tick-top`) and downward-pointing triangle caret (`▼`, `.caret-top`).
  - **Labels & Tooltips**: subtle range hint `(70%–90%)` and hover tooltips on the bar and markers.

### 3. Language Policy — 100% English
- **ZERO Cyrillic characters** in code, comments, documentation, commit messages, or translation dictionaries.
- Frontend strings must go through `t(this.hass, "key")` in `cards/src/core/i18n.ts`.
- Backend strings must live in `custom_components/smart_charger/translations/en.json` and `strings.json`.

### 4. Committed Distribution Bundle
- Whenever any file in `cards/src/` is modified, you **must run `npm --prefix cards run build`** and commit the resulting `dist/ha-smart-charging-card.js` alongside the source code.

### 5. Design System & HA Tokens
- **Never invent hardcoded hex values or pixel sizes** where Home Assistant provides design tokens:
  - Colors: `var(--primary-color)`, `var(--primary-text-color)`, `var(--secondary-text-color)`, `var(--divider-color)`, `var(--card-background-color)`.
  - Fonts: `var(--ha-font-size-s, 12px)`, `var(--ha-font-size-m, 14px)`.
  - Radii: `var(--ha-border-radius-pill, 9999px)`, `var(--ha-border-radius-lg, 12px)`.
- Reuse existing HA elements (`ha-icon`, `ha-switch`, `ha-card`) rather than writing custom equivalents.

---

## 3. Essential Commands

```sh
# Frontend development
cd cards
npm run dev                    # Vite dev server for live testing
npm run build                  # TypeScript check & production bundle -> ../dist/ha-smart-charging-card.js

# Full build, sync to live host, and cache bust
python3 script/publish.py      # Builds cards, rsyncs to server-home, updates Lovelace resource hash via WebSocket

# Quality & Verification checks
npm --prefix cards run build   # Must compile cleanly (0 errors)
# Verify no Cyrillic characters remain:
grep -rnP --exclude-dir=node_modules --exclude-dir=.git '[\x{0400}-\x{04FF}]' .
# Render & measure card layout via headless Chrome:
google-chrome-stable --headless --disable-gpu --screenshot=scratch/verify.png --window-size=600,600 file:///path/to/test.html
```

---

## 4. Testing & Verification Checklist

Before reporting completion or committing:
1. **TypeScript Build**: `npm --prefix cards run build` exits with code 0.
2. **Height Verification**: Confirm header and every socket item are exactly `56px` high.
3. **Cyrillic Audit**: Run the grep command above to ensure zero non-English characters.
4. **Publish to Live HA**: Run `python3 script/publish.py` to deploy to `server-home` and reload the Lovelace dashboard tab.
5. **Git Commit**: Clean English commit message following conventional commits (`feat: ...`, `fix: ...`, `chore: ...`).
