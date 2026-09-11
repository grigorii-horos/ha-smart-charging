import { FormCardEditor, type SchemaItem } from "./base-editor";
import { registerEditor } from "../core/register";

export class HorosChargersCardEditor extends FormCardEditor {
  protected get schema(): SchemaItem[] {
    return [
      { name: "title", selector: { text: {} } },
      {
        name: "chargers",
        selector: {
          entity: {
            multiple: true,
            filter: [
              { domain: "switch" },
              { domain: "sensor" },
            ],
          },
        },
      },
    ];
  }

  protected get labels(): Record<string, string> {
    return {
      title: "Title / Заголовок",
      chargers: "Chargers / Розетки (leave empty to auto-discover)",
    };
  }
}

registerEditor("horos-chargers-card-editor", HorosChargersCardEditor);

declare global {
  interface HTMLElementTagNameMap {
    "horos-chargers-card-editor": HorosChargersCardEditor;
  }
}
