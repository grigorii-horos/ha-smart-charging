/**
 * An item of an entity list in a card config.
 *
 * Lists describe very different things — cartridges, consumables, area sensors,
 * power consumers, a person's devices — but they are all shaped the same: either
 * just an entity_id, or the same with its own name, icon and colour.
 */
export interface EntityItem {
  entity: string;
  name?: string;
  icon?: string;
  color?: string;
}

/** Expands the short form into the full one. */
export function normalizeItem(item: EntityItem | string): EntityItem {
  return typeof item === "string" ? { entity: item } : item;
}
