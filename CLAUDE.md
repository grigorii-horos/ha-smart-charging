# CLAUDE.md

Smart Charging integration and Lovelace cards for Home Assistant.

## The main rules

1. **Backend (`custom_components/smart_charger`)**:
   - Clean async Home Assistant integration following HA component architecture.
   - Handles power jump detection, 15s identification delay, connection freshness verification (< 120s), 15m/30m probe loops, hysteresis recharging, and manual 100% force mode.
   - Clean entity model: status sensor, button (force 100%), switch.

2. **Frontend (`cards/`)**:
   - **Reuse Home Assistant's own components instead of reimplementing their markup**: `ha-tile-container`, `ha-tile-icon`, `ha-tile-info`, `hui-card-features`, `ha-ripple`.
   - Built on Lit + TypeScript + Vite.
   - The card displays:
     - Socket name
     - Real-time connected device ("Phone Grigorii", "Tablet", "Pixel Watch", "Generic Device", or "Empty")
     - Big values on right: Power (W) and Battery (%)
     - Level bar: battery charge progress between min and max target
     - Actions: Force 100% and Power toggle
   - The overview card (`horos-chargers-card`) lists all configured charging sockets with live statuses.

## Commands

```sh
cd cards
npm run dev     # Vite dev server
npm run build   # tsc --noEmit && vite build -> ../dist/ha-smart-charging-card.js
npm test        # vitest
python3 script/publish.py  # build + deploy to HA host + update dashboard resource
```
