# Backlog & Architecture Concepts

This document tracks completed features, architectural principles (notably the 1-unit height concept), and future roadmap items for **`ha-smart-charging`**.

---

## 📐 Key Design Concepts & Architecture

### 1. The Standard Unit Height Rule (Strict 56px per Row)
- **Home Assistant Grid Foundation**: In Home Assistant Lovelace dashboards (especially the modern Section grid layout), the standard row unit is **56px** (derived from the stock `tile` card height).
- **Proportional Card Sizing**:
  - A card header represents **1 unit** (`56px`).
  - Each charging socket row represents **1 unit** (`56px`).
  - A card containing $N$ sockets must occupy exactly **$1 + N$ standard units**:
    - 1 socket $\rightarrow$ 2 units ($2 \times 56\text{px} = 112\text{px}$ + borders)
    - 2 sockets $\rightarrow$ 3 units ($3 \times 56\text{px} = 168\text{px}$ + borders)
    - $N$ sockets $\rightarrow 1 + N$ units
  - `getGridOptions().rows` returns `1 + N`, aligning the card with neighboring cards and grid rows.
- **Section Grid Filling (`:host([filled])`)**:
  - When Lovelace assigns fixed section row heights, `:host([filled])` applies `height: 100%` to `ha-card`.
  - Both `.card-header` and `.charger-item` receive `flex: 1 1 0; height: auto; min-height: 0;`.
  - This guarantees every element takes an identical, proportional fraction of the card height without overflow or awkward empty gaps.
- **Single Horizontal Line Constraint**:
  - **No stacked rows inside charger items.** Stacking a secondary bar below the primary row expands the item to ~85px, breaking the grid.
  - All elements (`.socket-icon` + `.socket-info` [primary line + secondary line] + `.row-actions`) must reside on a single horizontal row (`56px`).

### 2. Full-Width Inline Battery Bar Concept
- **Space Maximization**: The battery bar (`.battery-bar-wrap`) is placed directly inside `.secondary-line` with `flex: 1 1 0; min-width: 50px; height: 20px;`.
- **Dynamic Horizontal Expansion**: By using flexbox growth, the bar stretches to **100% of all available space** between the power readout (`0.0 W`) and the percentage text (`90%`), spanning ~150–300px depending on screen and card width.
- **Non-Colliding Cut-Off Markers**:
  - **Bottom Cut-off (`min_charge`, e.g. 70%)**: Info-blue tick (`.track-tick.tick-bottom`) and upward-pointing triangle caret (`▲`, `.caret-bottom`), indicating where charging begins/resumes.
  - **Top Cut-off (`max_charge`, e.g. 90%)**: High-contrast tick (`.track-tick.tick-top`) and downward-pointing triangle caret (`▼`, `.caret-top`), indicating where charging stops to preserve battery longevity.
  - Because bottom markers live strictly at the lower edge and top markers live strictly at the upper edge, they never visually collide or overlap even when limits are closely set.
- **Visual Detailing**:
  - Soft translucent target band (`.target-range-band`) connecting min and max thresholds.
  - Battery level fill with dynamic level-based hue (`#43a047` green, `#ffa600` orange, `#e53935` red).
  - Shimmer gradient animation during active charging.
  - Tactile 10px circular thumb dot with a pulsating glow when actively charging.

### 3. Smart Device Matching & Probing Algorithm
- **Power Jump Detection**: Sockets monitor power draw and identify a connection when power jumps above 2.5W.
- **15-Second Delay**: Waits 15 seconds after plug-in to allow mobile companion apps (Home Assistant Companion on Android / iOS) to update their battery sensors.
- **Connection Freshness Filter**: Only pairs devices whose battery update timestamp is within the last 120 seconds.
- **Cable Probing Loop**: When charging completes and the socket turns off, the cable is briefly probed (12s) after 15m and 30m intervals to verify whether the device has been unplugged or is still resting.
- **Hysteresis Recharging**: If a connected device rests in `sleep` mode and drops below `min_charge`, charging re-engages automatically.
- **Manual 100% Override**: Instant full-charge override with an automatic 3-hour safety timeout to prevent leaving battery at 100% permanently.

---

## ✅ Completed (Done)

- [x] **Core Integration Backend (`custom_components/smart_charger`)**:
  - [x] State machine implementing `idle`, `probing`, `charging`, `cooldown`, `sleep`, `manual_100`, and `generic` states.
  - [x] Device matching logic via battery level sensors and connection freshness.
  - [x] Hysteresis top-up charging loop.
  - [x] 15m / 30m cable probing cycles with short 12s test window.
  - [x] Config flow for GUI setup of sockets, power sensors, and device battery sensors.
  - [x] Primary sensor entity (`sensor.<id>_status`) with rich attributes (`power_w`, `connected_device`, `battery_level`, `min_charge`, `max_charge`, `is_probing`, `switch_entity`).
  - [x] Manual override button (`button.<id>_force_100`) and services (`smart_charger.force_100`).
- [x] **Frontend Lovelace Cards (`cards/src/`)**:
  - [x] Multi-charger overview card (`horos-chargers-card`): list of all sockets with live metrics, device pills, power draw, force 100% button, and switch toggles.
  - [x] Single-charger tile card (`horos-charger-tile`): standalone tile with big values and action chips.
  - [x] Visual card editors (`horos-chargers-card-editor` and `horos-charger-tile-editor`) using Home Assistant native form schemas.
  - [x] Auto-discovery of smart charger entities when no manual configuration is provided.
- [x] **Card Layout & Height Standardisation**:
  - [x] Enforced strict 56px standard unit height on header and each socket row.
  - [x] Card with $N$ chargers takes exactly $1 + N$ grid units (verified: header 56px + socket 56px + socket 56px = 170px total card height).
  - [x] Equal 1-unit partitioning in Section grid layout (`:host([filled])`).
- [x] **Full-Width Inline Battery Bar**:
  - [x] Stretches across all available horizontal space in `.secondary-line`.
  - [x] Bottom cutoff tick and upward caret (`▲`) at `min_charge`.
  - [x] Top cutoff tick and downward caret (`▼`) at `max_charge`.
  - [x] Target range band, animated charging shimmer, and pulsing thumb dot.
- [x] **Developer & Operational Tooling**:
  - [x] Deployment script `script/publish.py` to build, rsync to `server-home`, and invalidate Lovelace resource hash via WebSocket.
  - [x] Universal agent documentation (`AGENTS.md` and `CLAUDE.md` symlink).
  - [x] Zero Cyrillic audit across all repository files (100% English code, docs, and translations).
  - [x] Git repository created on GitHub (`grigorii-horos/ha-smart-charging`).

---

## 📋 Planned & Upcoming (To Do / Roadmap)

### Short-Term
- [ ] **Multi-Port Charging Hub Support**:
  - Support multi-device detection on shared multiport USB chargers (e.g. charging a phone and watch simultaneously on one smart plug) by detecting incremental power drops/rises.
- [ ] **Automated Backend Unit Tests**:
  - Add `pytest-homeassistant-custom-component` tests for coordinator state machine transitions, edge cases (device disconnect mid-probe, network timeout), and service handlers.
- [ ] **Frontend Vitest Tests**:
  - Add unit tests for card rendering, grid options calculations, and battery bar styling logic.

### Medium-Term
- [ ] **Energy & Session Statistics**:
  - Track total energy consumed (Wh) per charging session.
  - Log charging cycles and time-to-full estimations.
  - Expose energy sensors compatible with Home Assistant's Energy dashboard.
- [ ] **Alarm-Aware Smart Wakeup Charging**:
  - Integrate with the next morning's alarm clock from the mobile device (`sensor.phone_next_alarm`).
  - Keep battery at optimal 80% through the night, then top up to 100% within 30–45 minutes prior to the user's wake-up time.
- [ ] **Mobile Actionable Notifications**:
  - Send actionable push notification when a device reaches its charging limit: *"Phone reached 85%. Top up to 100%?"* with quick action buttons.
  - Reminder notification if a device has been left resting at 100% for over 2 hours.

### Long-Term / Exploratory
- [ ] **Machine Learning Charging Profiles**:
  - Automatically infer device identity from initial power draw curve (voltage/current handshake signatures) even without companion app battery sensors.
- [ ] **Battery Health Degradation Estimator**:
  - Calculate estimated battery lifespan extension achieved by avoiding high-temperature/100% saturation states.
