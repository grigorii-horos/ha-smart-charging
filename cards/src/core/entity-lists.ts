/**
 * Entity lists in the GUI editor.
 *
 * In the form a list is just entity_ids, while the config may hold objects with
 * their own name and icon. DOM-free module: the logic is covered by tests.
 */

/**
 * Rebuilds the list after a GUI edit, keeping the settings written by hand in
 * YAML. Otherwise picking one entity would wipe the names and icons of all the
 * others.
 */
export function mergeEntityList<T extends { entity: string }>(
  previous: (T | string)[] | undefined,
  entityIds: string[]
): (T | string)[] {
  const byEntity = new Map<string, T | string>();
  for (const item of previous ?? []) {
    byEntity.set(typeof item === "string" ? item : item.entity, item);
  }
  return entityIds.map((entityId) => byEntity.get(entityId) ?? entityId);
}

/** Pulls entity_ids out of a list that may mix strings and objects. */
export function entityIdsOf(
  items: ({ entity: string } | string)[] | undefined
): string[] {
  return (items ?? []).map((item) =>
    typeof item === "string" ? item : item.entity
  );
}
