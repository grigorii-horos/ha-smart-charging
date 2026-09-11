/**
 * Parsing the list of buttons. A separate DOM-free module, like the rest of the
 * pure logic, so that tests cover it.
 */

export interface ButtonConfig {
  /** What we press: script, scene, button, switch — anything pressable. */
  entity: string;
  name?: string;
  icon?: string;
}

/**
 * The default button label. Scripts carry names like "IR — Bedroom: Night Mode":
 * the shared prefix is not needed on a button, the card heading already said it.
 */
export function buttonLabel(
  friendlyName: string | undefined
): string | undefined {
  if (!friendlyName) return undefined;
  const afterColon = friendlyName.split(":").pop();
  return afterColon ? afterColon.trim() : friendlyName;
}

export function normalizeButton(button: ButtonConfig | string): ButtonConfig {
  return typeof button === "string" ? { entity: button } : button;
}
