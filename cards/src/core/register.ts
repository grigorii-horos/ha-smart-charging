import type { CardSuggestion, CustomCardEntry, HomeAssistant } from "./types";
import { languageOf } from "./i18n";

/**
 * Registering cards and editors in a way that survives a second bundle load.
 *
 * `customElements.define` on a name already taken throws, and the whole module
 * dies with it. That happens routinely: the dev resource is still in the
 * dashboard and one installed through HACS shows up next to it. Whichever loaded
 * first wins — so you can end up looking at old code thinking it updated.
 *
 * So the second copy quietly yields to the first and says so in the console.
 */

let warned = false;

function alreadyLoaded(tag: string): void {
  if (warned) return;
  warned = true;
  // eslint-disable-next-line no-console
  console.warn(
    `horos-cards: card ${tag} is already registered. The bundle looks to be ` +
      `attached to the dashboard twice — the copy that loaded first is the one ` +
      `running. Check the dashboard resources.`
  );
}

/**
 * The user's language at the moment the card list is read.
 *
 * The list is filled while the bundle loads, when no card has `hass` yet. So the
 * name and description are getters rather than strings: HA asks for them when it
 * opens the picker, and by then the application is already on the page.
 */
function currentLanguage(): string {
  const app = document.querySelector("home-assistant") as
    | { hass?: HomeAssistant }
    | null;
  return languageOf(app?.hass);
}

export interface CardTexts {
  ru: string;
  en: string;
}

export function registerCard(
  tag: string,
  ctor: CustomElementConstructor,
  entry: {
    type: string;
    name: CardTexts;
    description: CardTexts;
    preview?: boolean;
    /**
     * What to offer for an entity the user picked in the "Add to dashboard"
     * dialog. Returning null means this card has nothing to say about it.
     */
    suggest?: (
      hass: HomeAssistant,
      entityId: string
    ) => CardSuggestion | CardSuggestion[] | null;
  }
): void {
  if (customElements.get(tag)) {
    alreadyLoaded(tag);
    return;
  }
  customElements.define(tag, ctor);
  window.customCards = window.customCards ?? [];
  window.customCards.push({
    type: entry.type,
    preview: entry.preview,
    get name() {
      return entry.name[currentLanguage() === "ru" ? "ru" : "en"];
    },
    get description() {
      return entry.description[currentLanguage() === "ru" ? "ru" : "en"];
    },
    getEntitySuggestion: entry.suggest,
  } as CustomCardEntry);
}

export function registerEditor(
  tag: string,
  ctor: CustomElementConstructor
): void {
  if (customElements.get(tag)) return;
  customElements.define(tag, ctor);
}
