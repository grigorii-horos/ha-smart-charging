import {
  BaseCardEditor,
  entitySelector,
  interactionsSection,
  type SchemaItem,
} from "./base-editor";
import { registerEditor } from "../core/register";

export class HorosChargerTileEditor extends BaseCardEditor {
  protected get entityField(): string {
    return "entity";
  }

  protected get schema(): SchemaItem[] {
    return [
      { name: "name", selector: { text: {} } },
      { name: "entity", selector: entitySelector("sensor") },
      { name: "switch", selector: entitySelector("switch") },
      { name: "power", selector: entitySelector("sensor", "power") },
      interactionsSection("switch", "toggle"),
    ];
  }

  protected get labels(): Record<string, string> {
    return this.pick({
      ru: {
        name: "Название",
        entity: "Сенсор статуса (smart_charger)",
        switch: "Выключатель розетки",
        power: "Датчик мощности",
      },
      en: {
        name: "Name",
        entity: "Status sensor (smart_charger)",
        switch: "Socket switch",
        power: "Power sensor",
      },
    });
  }
}

registerEditor("horos-charger-tile-editor", HorosChargerTileEditor);

declare global {
  interface HTMLElementTagNameMap {
    "horos-charger-tile-editor": HorosChargerTileEditor;
  }
}
