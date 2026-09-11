/**
 * Card strings in the user's language.
 *
 * Home Assistant translates states itself, while our labels used to be hard-coded
 * Russian. On an English interface that produced a Russian "all clear, 1 sensor"
 * next to "Docked · Standard · Charging" — half the card in one language, half
 * in the other.
 *
 * Card names in the picker stay English: that list is filled while the bundle
 * loads, before the user's language is known.
 */
import type { HomeAssistant } from "./types";

type Dict = Record<string, string>;

const RU: Dict = {
  "entity.missing.one": "Сущность не найдена: {list}",
  "entity.missing.many": "Сущности не найдены: {list}",
  "internals.failed": "Не удалось загрузить компоненты Home Assistant",
  "value.unknown": "нет данных",

  "batteries.title": "Батарейки",
  "batteries.allFull": "Все заряжены, {count} шт.",

  "charger.title": "Умная зарядка",
  "charger.idle": "Свободно",
  "charger.charging": "Зарядка",
  "charger.cooldown": "Остывание",
  "charger.sleep": "Пауза",
  "charger.manual_100": "Режим 100%",
  "charger.generic": "Обычное устройство",
  "charger.force_100": "Зарядить до 100%",
  "charger.stop": "Остановить",
  "charger.probing": "Проверка кабеля...",
  "charger.connected": "Подключено",
  "charger.limit": "Лимит {min}% – {max}%",
  "charger.noChargers": "Нет настроенных розеток",

  "safety.title": "Безопасность",
  "safety.calm.one": "Всё спокойно, {count} датчик",
  "safety.calm.few": "Всё спокойно, {count} датчика",
  "safety.calm.many": "Всё спокойно, {count} датчиков",
  "safety.offline": "{name}: нет связи",

  "presence.title": "Присутствие",
  "presence.empty.one": "Пусто, {count} зона",
  "presence.empty.few": "Пусто, {count} зоны",
  "presence.empty.many": "Пусто, {count} зон",

  "energy.title": "Энергия",
  "energy.consuming": "{count} потребляют",
  "energy.idle": "Никто не потребляет",

  "offline.count": "{count} без связи",
  "offline.title": "Не отвечает",
  "offline.allAnswer": "Все на связи",
  "offline.more.one": "и ещё {count}",
  "offline.more.few": "и ещё {count}",
  "offline.more.many": "и ещё {count}",
  "list.missing.one": "{count} не найдена",
  "list.missing.few": "{count} не найдены",
  "list.missing.many": "{count} не найдено",

  "alerts.title": "Оповещения",
  "alerts.calm": "Всё тихо, {count} под присмотром",
  "alerts.offline": "{name}: нет связи",

  "lamp.title": "Лампа",
  "lamp.bright": "Ярче",
  "lamp.dim": "Тусклее",
  "lamp.warm": "Теплее",
  "lamp.cold": "Холоднее",
  "weather.noForecast": "прогноза на дни нет",

  "greenhouse.title": "Оранжерея",
  "greenhouse.thirsty.one": "{count} из {total} просит воды",
  "greenhouse.thirsty.few": "{count} из {total} просят воды",
  "greenhouse.thirsty.many": "{count} из {total} просят воды",
  "greenhouse.watered.one": "Политы, {count} растение",
  "greenhouse.watered.few": "Политы, {count} растения",
  "greenhouse.watered.many": "Политы, {count} растений",
  "greenhouse.soaked.one": "{count} залит",
  "greenhouse.soaked.few": "{count} залиты",
  "greenhouse.soaked.many": "{count} залито",

  "heating.title": "Отопление",
  "heating.calling.one": "{count} из {total} просит",
  "heating.calling.few": "{count} из {total} просят",
  "heating.calling.many": "{count} из {total} просят",
  "heating.quiet": "Тепла не просят",

  "light.title": "Свет",
  "light.count": "Горит {count} из {total}",
  "light.allOff": "Все выключены",
  "light.on": "вкл",
  "light.off": "выкл",

  "media.title": "Медиа",
  "media.idle": "Ничего не играет",
  "media.playing.one": "{count} играет",
  "media.playing.few": "{count} играют",
  "media.playing.many": "{count} играют",

  "ac.title": "Кондиционер",

  "updates.title": "Обновления",
  "updates.upToDate": "Всё обновлено",
  "updates.count.one": "{count} обновление",
  "updates.count.few": "{count} обновления",
  "updates.count.many": "{count} обновлений",

  "tasks.title": "Задачи",
  "tasks.none": "Дел нет",
  "tasks.noEvents": "Событий впереди нет",

  "server.title": "Домашний сервер",
  "vacuum.title": "Пылесос",
  "printer.title": "Принтер",
  "computer.title": "Компьютер",
  "person.title": "Человек",
  "air.title": "Воздух",
  "cover.title": "Шторы",

  "level.cpu": "CPU",
  "level.memory": "Память",
  "level.gpu": "GPU",
  "level.disk": "Диск",
  "level.diskFree": "Свободно",
  "level.open": "Открыто",
};

const EN: Dict = {
  "entity.missing.one": "Entity not found: {list}",
  "entity.missing.many": "Entities not found: {list}",
  "internals.failed": "Could not load Home Assistant components",
  "value.unknown": "no data",

  "batteries.title": "Batteries",
  "batteries.allFull": "All full, {count} pcs",

  "charger.title": "Smart Charger",
  "charger.idle": "Idle",
  "charger.charging": "Charging",
  "charger.cooldown": "Cooldown",
  "charger.sleep": "Sleep",
  "charger.manual_100": "Manual 100%",
  "charger.generic": "Generic device",
  "charger.force_100": "Force 100%",
  "charger.stop": "Stop",
  "charger.probing": "Probing cable...",
  "charger.connected": "Connected",
  "charger.limit": "Limit {min}% – {max}%",
  "charger.noChargers": "No chargers configured",

  "safety.title": "Safety",
  "safety.calm.one": "All clear, {count} sensor",
  "safety.calm.many": "All clear, {count} sensors",
  "safety.offline": "{name}: no connection",

  "presence.title": "Presence",
  "presence.empty.one": "Empty, {count} area",
  "presence.empty.many": "Empty, {count} areas",

  "energy.title": "Energy",
  "energy.consuming": "{count} drawing power",
  "energy.idle": "Nothing drawing power",

  "offline.count": "{count} offline",
  "offline.title": "Not responding",
  "offline.allAnswer": "Everything is answering",
  "offline.more.one": "and {count} more",
  "offline.more.many": "and {count} more",
  "list.missing.one": "{count} not found",
  "list.missing.many": "{count} not found",

  "alerts.title": "Alerts",
  "alerts.calm": "All quiet, {count} watched",
  "alerts.offline": "{name}: no connection",

  "lamp.title": "Lamp",
  "lamp.bright": "Brighter",
  "lamp.dim": "Dimmer",
  "lamp.warm": "Warmer",
  "lamp.cold": "Colder",
  "weather.noForecast": "no daily forecast",

  "greenhouse.title": "Greenhouse",
  "greenhouse.thirsty.one": "{count} of {total} needs water",
  "greenhouse.thirsty.many": "{count} of {total} need water",
  "greenhouse.watered.one": "Watered, {count} plant",
  "greenhouse.watered.many": "Watered, {count} plants",
  "greenhouse.soaked.one": "{count} overwatered",
  "greenhouse.soaked.many": "{count} overwatered",

  "heating.title": "Heating",
  "heating.calling.one": "{count} of {total} calling",
  "heating.calling.many": "{count} of {total} calling",
  "heating.quiet": "No demand",

  "light.title": "Lights",
  "light.count": "{count} of {total} on",
  "light.allOff": "All off",
  "light.on": "on",
  "light.off": "off",

  "media.title": "Media",
  "media.idle": "Nothing playing",
  "media.playing.one": "{count} playing",
  "media.playing.many": "{count} playing",

  "ac.title": "Air conditioner",

  "updates.title": "Updates",
  "updates.upToDate": "Everything up to date",
  "updates.count.one": "{count} update",
  "updates.count.many": "{count} updates",

  "tasks.title": "Tasks",
  "tasks.none": "Nothing to do",
  "tasks.noEvents": "Nothing coming up",

  "server.title": "Home server",
  "vacuum.title": "Vacuum",
  "printer.title": "Printer",
  "computer.title": "Computer",
  "person.title": "Person",
  "air.title": "Air",
  "cover.title": "Curtains",

  "level.cpu": "CPU",
  "level.memory": "Memory",
  "level.gpu": "GPU",
  "level.disk": "Disk",
  "level.diskFree": "Free",
  "level.open": "Open",
};

const DICTS: Record<string, Dict> = { ru: RU, en: EN };

/** The user's language from hass; for an unknown language we speak English. */
export function languageOf(hass: HomeAssistant | undefined): string {
  const language = hass?.language ?? hass?.locale?.language ?? "en";
  const base = language.split("-")[0].toLowerCase();
  return base in DICTS ? base : "en";
}

/**
 * Plural form. Russian has three of them, English two — a form that does not
 * match the count grates in both.
 */
function pluralForm(language: string, count: number): "one" | "few" | "many" {
  if (language !== "ru") return count === 1 ? "one" : "many";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "one";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
  return "many";
}

export function t(
  hass: HomeAssistant | undefined,
  key: string,
  params: Record<string, string | number> = {}
): string {
  const language = languageOf(hass);
  const dict = DICTS[language] ?? EN;

  // A key with a counter can have forms: safety.calm.one / .few / .many
  const count = params.count;
  const form =
    typeof count === "number"
      ? `${key}.${pluralForm(language, count)}`
      : undefined;

  const template =
    (form && (dict[form] ?? EN[form])) ?? dict[key] ?? EN[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in params ? String(params[name]) : whole
  );
}
