/**
 * Access to the internal components of the HA frontend.
 *
 * The cards don't reimplement the stock tile's markup, they are assembled from
 * its own components: `ha-tile-container` (the body, ripple, gestures, the hold
 * indicator, focus), `ha-tile-icon`, `ha-tile-info`, `hui-card-features`.
 *
 * They are not exported, but they do get registered in the page's element
 * registry once HA loads the stock tile's bundle. So we ask HA to create an
 * ordinary tile — purely for the side effect of that import — and then wait for
 * the registration.
 */

const REGISTRATION_TIMEOUT = 5000;

/** Everything a card is assembled from. */
const REQUIRED_ELEMENTS = [
  "ha-tile-container",
  "ha-tile-icon",
  "ha-tile-info",
  "hui-card-features",
] as const;

/**
 * The controls a stock feature is built from: the button row of the cover
 * feature, the segmented selector of the climate modes. They arrive with the
 * feature bundles rather than with the tile, so they need a nudge of their own.
 */
const CONTROL_ELEMENTS = [
  "ha-control-button",
  "ha-control-button-group",
  "ha-control-select",
] as const;

let pending: Promise<boolean> | undefined;
let pendingControls: Promise<boolean> | undefined;
let pendingEditor: Promise<boolean> | undefined;

interface CardHelpers {
  createCardElement?: (config: Record<string, unknown>) => HTMLElement;
}

function whenDefined(tag: string, timeout: number): Promise<boolean> {
  if (customElements.get(tag)) return Promise.resolve(true);
  return Promise.race([
    customElements.whenDefined(tag).then(() => true),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeout)),
  ]);
}

async function loadTileBundle(): Promise<void> {
  const loader = (
    window as unknown as { loadCardHelpers?: () => Promise<CardHelpers> }
  ).loadCardHelpers;
  if (!loader) return;
  try {
    const helpers = await loader();
    // The element itself is not needed, the side effect of the import is.
    helpers.createCardElement?.({ type: "tile", entity: "sun.sun" });
  } catch {
    // The config may not have fit — that does not affect the import.
  }
}

/** true — the tile components are available and a card can be assembled. */
export function ensureTileInternals(): Promise<boolean> {
  if (pending) return pending;

  pending = (async () => {
    if (REQUIRED_ELEMENTS.every((tag) => customElements.get(tag))) return true;
    await loadTileBundle();
    const results = await Promise.all(
      REQUIRED_ELEMENTS.map((tag) => whenDefined(tag, REGISTRATION_TIMEOUT))
    );
    return results.every(Boolean);
  })();

  return pending;
}

/**
 * true — HA's own controls are available.
 *
 * A feature element imports them, and features are loaded on demand, so a
 * dashboard whose cards have no features has none of them. Rendering a tile
 * that asks for a couple of features is what pulls them in; the tile is
 * attached out of sight because Lit imports them while rendering, not while
 * being constructed.
 */
export function ensureControls(): Promise<boolean> {
  if (pendingControls) return pendingControls;

  pendingControls = (async () => {
    if (CONTROL_ELEMENTS.every((tag) => customElements.get(tag))) return true;
    await ensureTileInternals();

    const loader = (
      window as unknown as { loadCardHelpers?: () => Promise<CardHelpers> }
    ).loadCardHelpers;
    let probe: HTMLElement | undefined;
    try {
      const helpers = await loader?.();
      probe = helpers?.createCardElement?.({
        type: "tile",
        entity: "sun.sun",
        features: [{ type: "cover-open-close" }, { type: "climate-hvac-modes" }],
      });
      if (probe) {
        probe.style.position = "absolute";
        probe.style.left = "-9999px";
        document.body.appendChild(probe);
      }
    } catch {
      // The features do not fit sun.sun — the import is all we are after.
    }

    const results = await Promise.all(
      CONTROL_ELEMENTS.map((tag) => whenDefined(tag, REGISTRATION_TIMEOUT))
    );
    probe?.remove();
    return results.every(Boolean);
  })();

  return pendingControls;
}

/**
 * The features editor lives in the tile editor's bundle, separate from the tile's
 * own. We ask HA to build that editor to get hold of it.
 */
export function ensureFeaturesEditor(): Promise<boolean> {
  if (pendingEditor) return pendingEditor;

  pendingEditor = (async () => {
    if (customElements.get("hui-card-features-editor")) return true;
    await ensureTileInternals();

    const tileCard = customElements.get("hui-tile-card") as
      | { getConfigElement?: () => Promise<HTMLElement> }
      | undefined;
    try {
      await tileCard?.getConfigElement?.();
    } catch {
      // We only need the side effect of the import.
    }

    return whenDefined("hui-card-features-editor", REGISTRATION_TIMEOUT);
  })();

  return pendingEditor;
}
