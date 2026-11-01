import data from "./menu.json";
import cats from "./categories.json";
import type {
  MenuItem,
  OrderItem,
  ParsedOrder,
  Issue,
  OrderNote,
} from "./types";
export const menu = data as MenuItem[];
export const categories = cats;
export const menuById = new Map(menu.map((m) => [m.id, m]));
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKC")
    .replace(/ё/g, "е")
    .replace(/[–—]/g, " ")
    .replace(/(?<!\d)-(?!\d)/g, " ")
    .replace(/[«»"!?;:()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const phrase = (s: string) =>
  new RegExp(`(?<![\\p{L}\\p{N}])${esc(normalize(s))}(?![\\p{L}\\p{N}])`, "gu");
const quantities: Record<string, number> = {
  бір: 1,
  бир: 1,
  біреу: 1,
  один: 1,
  одна: 1,
  одно: 1,
  одну: 1,
  одного: 1,
  екі: 2,
  еки: 2,
  два: 2,
  две: 2,
  екіеу: 2,
  үш: 3,
  уш: 3,
  три: 3,
  төрт: 4,
  торт: 4,
  четыре: 4,
  бес: 5,
  пять: 5,
  алты: 6,
  шесть: 6,
  жеті: 7,
  семь: 7,
  сегіз: 8,
  восемь: 8,
  тоғыз: 9,
  девять: 9,
  он: 10,
  десять: 10,
};
const qtyPattern = `(?:[+-]?\\d+(?:[.,]\\d+)?|${Object.keys(quantities).join("|")})`;
const notesRules: [string, string[]][] = [
  [
    "Овсяное молоко",
    [
      "овсяное молоко",
      "на овсяном молоке",
      "овсяном молоке",
      "овсяное",
      "овсяном",
      "сұлы сүтімен",
      "сұлы сүті",
    ],
  ],
  [
    "Безлактозное молоко",
    [
      "безлактозное молоко",
      "на безлактозном",
      "безлактозное",
      "лактозасыз сүт",
    ],
  ],
  ["Кокосовое молоко", ["кокосовое молоко", "кокосовом молоке"]],
  ["Миндальное молоко", ["миндальное молоко", "миндальном молоке"]],
  ["Без сахара", ["без сахара", "қантсыз", "кантсыз"]],
  ["С сахаром", ["с сахаром", "қантпен"]],
  ["Без лука", ["без лука", "пиязсыз"]],
  ["Без соуса", ["без соуса", "тұздықсыз"]],
  ["Без соли", ["без соли", "тұзсыз"]],
  ["Без сыра", ["без сыра", "ірімшіксіз"]],
  ["Без льда", ["без льда", "мұзсыз"]],
  ["Со льдом", ["со льдом", "мұзбен"]],
  ["Двойной сыр", ["двойной сыр", "қос ірімшік"]],
  ["С собой", ["с собой", "алып кетуге"]],
];
export const modifierNames: Record<string, { ru: string; kk: string }> = {
  milk: { ru: "Молоко", kk: "Сүт" },
  sugar: { ru: "Сахар", kk: "Қант" },
  options: { ru: "Пожелания", kk: "Тілектер" },
};
const aliasMap = new Map<string, string[]>();
for (const m of menu)
  for (const a of new Set(
    [...m.aliases, m.name_ru, m.name_kk].map(normalize),
  )) {
    if (a)
      (aliasMap.get(a) ?? (aliasMap.set(a, []), aliasMap.get(a)!)).push(m.id);
  }
const aliases = [...aliasMap.entries()]
  .sort((a, b) => b[0].length - a[0].length)
  .map(([alias, ids]) => ({
    alias,
    ids: [...new Set(ids)],
    regex: phrase(alias),
  }));
const filler = [
  "мне",
  "нам",
  "дайте",
  "можно",
  "пожалуйста",
  "и",
  "ещё",
  "еще",
  "а",
  "также",
  "маған",
  "бізге",
  "беріңіз",
  "берініз",
  "және",
  "тагы",
  "тағы",
  "да",
  "дана",
  "штук",
  "штуки",
  "порции",
  "порцию",
  "порций",
  "шт",
  "на",
  "с",
  "алып",
  "бер",
  "мен",
  "закажу",
  "хочу",
  "добавьте",
  "пожалуй",
  "заказ",
  "нужно",
  "нужен",
  "нужна",
  "керек",
  "берші",
  "рахмет",
  "спасибо",
  "сәлем",
  "салем",
  "здравствуйте",
  "добрый день",
  "заказать",
  "возьму",
  "давайте",
  "закажите",
  "можете",
  "могли бы",
  "будьте добры",
  "для меня",
  "вашего",
  "вашу",
  "ваш",
  "ваше",
  "ваших",
  "этого",
  "этот",
  "эту",
  "алғым келеді",
];
const cleanResidual = (s: string) => {
  for (const word of filler.sort((a, b) => b.length - a.length))
    s = s.replace(phrase(word), " ");
  return s.replace(/[,\.\s+]+/g, " ").trim();
};
export function makeItem(id: string, qty = 1, rowId?: string): OrderItem {
  return {
    rowId: rowId ?? `manual-${crypto.randomUUID()}`,
    menu_id: id,
    qty,
    size: null,
    mods: {},
    notes: [],
  };
}
export function parseOrder(raw_text: string): ParsedOrder {
  const text = normalize(raw_text).replace(/капп?уччино/g, "капучино");
  const matches: {
    start: number;
    end: number;
    ids: string[];
    alias: string;
  }[] = [];
  for (const a of aliases)
    for (const m of text.matchAll(a.regex))
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        ids: a.ids,
        alias: m[0],
      });
  // Prefer whole dish names, including combinations, to their shorter constituents.
  matches.sort(
    (a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start,
  );
  const accepted: typeof matches = [];
  for (const m of matches)
    if (!accepted.some((x) => m.start < x.end && m.end > x.start))
      accepted.push(m);
  accepted.sort((a, b) => a.start - b.start);
  const noteHits: {
    start: number;
    end: number;
    text: string;
    owner: number;
  }[] = [];
  for (const [canonical, terms] of notesRules)
    for (const term of terms)
      for (const hit of text.matchAll(phrase(term))) {
        const start = hit.index,
          end = start + hit[0].length;
        if (
          accepted.some((m) => start < m.end && end > m.start) ||
          !accepted.length
        )
          continue;
        const previous =
          accepted
            .map((m, i) => (m.end <= start ? i : -1))
            .filter((i) => i >= 0)
            .at(-1) ?? -1;
        let owner = previous < 0 ? 0 : previous;
        const next = accepted.findIndex((m) => m.start >= end);
        if (previous >= 0 && next >= 0) {
          const left = text.slice(accepted[previous].end, start),
            right = text.slice(end, accepted[next].start);
          const boundary = /(?:,|(?<![\p{L}])(?:и|және|тағы)(?![\p{L}]))/u;
          if (boundary.test(left) && !boundary.test(right)) owner = next;
        }
        noteHits.push({ start, end, text: canonical, owner });
      }
  noteHits.sort((a, b) => b.end - b.start - (a.end - a.start));
  const selectedNotes: typeof noteHits = [];
  for (const hit of noteHits)
    if (!selectedNotes.some((n) => hit.start < n.end && hit.end > n.start))
      selectedNotes.push(hit);
  const consumed: { start: number; end: number }[] = [
    ...accepted,
    ...selectedNotes,
  ];
  const issues: Issue[] = [];
  const items = accepted.map((m, index): OrderItem => {
    const start = index ? accepted[index - 1].end : 0,
      end = accepted[index + 1]?.start ?? text.length;
    const before = text.slice(start, m.start),
      after = text.slice(m.end, end),
      rowId = `row-${index}`;
    const product = menuById.get(m.ids[0])!;
    const contextWords = [
      "порции",
      "порцию",
      "порций",
      "штуки",
      "штук",
      "дана",
      "вашего",
      "ваш",
      "ваших",
      "этого",
      "этот",
      ...(product.name_ru.startsWith("Суп") || product.category === "soup"
        ? ["супа", "суп"]
        : []),
    ].join("|");
    let qty = 1;
    const q = before.match(
      new RegExp(
        `(?:^|[\\s,])(${qtyPattern})(?:\\s+(?:${contextWords}))*\\s*$`,
        "u",
      ),
    );
    if (q) {
      qty = quantities[q[1]] ?? Number(q[1].replace(",", "."));
      const at = start + q.index! + q[0].indexOf(q[1]);
      consumed.push({ start: at, end: m.start });
    } else {
      const post = after.match(
        new RegExp(
          `^\\s+(${qtyPattern})(?:\\s*(?:шт|штуки|штук|дана|порции))?(?=\\s*(?:,|$))`,
          "u",
        ),
      );
      if (post) {
        qty = quantities[post[1]] ?? Number(post[1]);
        consumed.push({ start: m.end, end: m.end + post[0].length });
      }
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
      issues.push({
        id: `qty-${rowId}`,
        rowId,
        kind: "unsupported",
        message_ru: "Уточните количество: от 1 до 20 порций.",
        message_kk: "Санын нақтылаңыз: 1–20 порция.",
      });
      qty = 1;
    }
    let ids = m.ids;
    // A stated volume disambiguates Single/Boom only when that serving exists in the PDF.
    const volume = after.match(/^\s*(300|400)\s*(?:мл|миллилитров)?/);
    if (volume && ids.length > 1) {
      const filtered = ids.filter(
        (id) => menuById.get(id)!.serving === `${volume[1]} мл`,
      );
      if (filtered.length) {
        ids = filtered;
        consumed.push({ start: m.end, end: m.end + volume[0].length });
      }
    }
    const notes: OrderNote[] = [
      ...new Set(
        selectedNotes.filter((n) => n.owner === index).map((n) => n.text),
      ),
    ].map((text) => ({ text, reviewed: text === "С собой", extra: 0 }));
    return {
      rowId,
      menu_id: ids.length === 1 ? ids[0] : "",
      candidates: ids.length > 1 ? ids : undefined,
      mention: m.alias,
      qty,
      size: null,
      mods: {},
      notes,
    };
  });
  const chars = text.split("");
  for (const c of consumed)
    for (let i = c.start; i < c.end; i++) chars[i] = " ";
  const residual = cleanResidual(chars.join(""));
  if (residual)
    issues.push({
      id: "unmatched",
      kind: "unknown",
      fragment: residual,
      message_ru: `Уточните фрагмент: «${residual}»`,
      message_kk: `Үзіндіні нақтылаңыз: «${residual}»`,
    });
  return { raw_text, items, issues, engine: "catalog" };
}
export function validateOrder(order: ParsedOrder): Issue[] {
  const issues = order.issues.filter(
    (i) =>
      !i.resolved && (!i.rowId || order.items.some((x) => x.rowId === i.rowId)),
  );
  for (const item of order.items) {
    const p = menuById.get(item.menu_id);
    if (!p) {
      issues.push({
        id: `choice-${item.rowId}`,
        rowId: item.rowId,
        kind: item.candidates?.length ? "choice" : "unknown",
        message_ru: item.candidates?.length
          ? "Выберите точную позицию из меню."
          : "Позиция не найдена в меню.",
        message_kk: item.candidates?.length
          ? "Мәзірден нақты өнімді таңдаңыз."
          : "Өнім мәзірден табылмады.",
      });
    }
    if (item.qty < 1 || item.qty > 20 || !Number.isInteger(item.qty))
      issues.push({
        id: `qty-${item.rowId}`,
        rowId: item.rowId,
        kind: "unsupported",
        message_ru: "Проверьте количество.",
        message_kk: "Санын тексеріңіз.",
      });
    if (item.size || Object.keys(item.mods).length)
      issues.push({
        id: `legacy-${item.rowId}`,
        rowId: item.rowId,
        kind: "unsupported",
        message_ru: "Выберите позицию с объёмом из каталога.",
        message_kk: "Көлемі көрсетілген өнімді таңдаңыз.",
      });
    for (const [i, n] of (item.notes ?? []).entries())
      if (
        !n.reviewed ||
        !Number.isFinite(n.extra) ||
        n.extra < 0 ||
        n.extra > 50000
      )
        issues.push({
          id: `note-${item.rowId}-${i}`,
          rowId: item.rowId,
          kind: "note",
          message_ru: `«${n.text}»: уточните доступность и доплату.`,
          message_kk: `«${n.text}»: қолжетімділігі мен қосымша ақысын нақтылаңыз.`,
        });
    const nt = (item.notes ?? []).map((n) => n.text);
    if (
      (nt.includes("Без сахара") && nt.includes("С сахаром")) ||
      (nt.includes("Без льда") && nt.includes("Со льдом"))
    )
      issues.push({
        id: `conflict-${item.rowId}`,
        rowId: item.rowId,
        kind: "conflict",
        message_ru: "Противоречивые пожелания. Удалите лишнее.",
        message_kk: "Қайшы тілектер. Артығын алып тастаңыз.",
      });
  }
  if (!order.items.length)
    issues.push({
      id: "empty",
      kind: "unknown",
      message_ru: "Добавьте хотя бы одну позицию.",
      message_kk: "Кемінде бір өнім қосыңыз.",
    });
  return issues;
}
export const itemTotal = (i: OrderItem) =>
  (menuById.get(i.menu_id)?.price ?? 0) * i.qty +
  (i.notes ?? []).reduce(
    (s, n) => s + (n.reviewed && Number.isFinite(n.extra) ? n.extra : 0),
    0,
  ) *
    i.qty;
export const orderTotal = (items: OrderItem[]) =>
  items.reduce((s, i) => s + itemTotal(i), 0);
export const searchMenu = (query: string, category = "all") => {
  const q = normalize(query);
  return menu.filter(
    (m) =>
      (category === "all" || m.category === category) &&
      (!q ||
        [m.name_ru, m.name_kk, ...m.aliases].some((a) =>
          normalize(a).includes(q),
        )),
  );
};
export interface ModelOrder {
  entries: {
    mention: string;
    menu_ids: string[];
    qty: number;
    notes: string[];
  }[];
  unmatched: string[];
}
export function sanitizeModelOrder(
  raw_text: string,
  model: ModelOrder,
): ParsedOrder {
  const local = parseOrder(raw_text);
  const issues: Issue[] = [];
  const items = model.entries.slice(0, 20).map((e, index): OrderItem => {
    const ids = [...new Set(e.menu_ids)].filter((id) => menuById.has(id));
    const exact =
      local.items.find(
        (i) => normalize(i.mention ?? "") === normalize(e.mention),
      ) ??
      local.items.find(
        (i) =>
          i.candidates?.some((id) => ids.includes(id)) ||
          ids.includes(i.menu_id),
      );
    // A model cannot silently select a size when the source phrase has no size.
    const candidates = exact?.candidates?.length ? exact.candidates : ids;
    if (!ids.length)
      issues.push({
        id: `invalid-model-${index}`,
        kind: "unknown",
        fragment: e.mention,
        message_ru: `В меню нет: «${e.mention}»`,
        message_kk: `Мәзірде жоқ: «${e.mention}»`,
      });
    return {
      rowId: `row-${index}`,
      menu_id: candidates.length === 1 ? candidates[0] : "",
      candidates: candidates.length > 1 ? candidates : undefined,
      qty: e.qty,
      size: null,
      mods: {},
      mention: e.mention,
      notes: [
        ...new Set([...e.notes, ...(exact?.notes ?? []).map((n) => n.text)]),
      ].map((text) => ({
        text: text.slice(0, 180),
        reviewed: text === "С собой",
        extra: 0,
      })),
    };
  });
  for (const [i, fragment] of model.unmatched.entries())
    issues.push({
      id: `unknown-${i}`,
      kind: "unknown",
      fragment,
      message_ru: `Уточните: «${fragment}»`,
      message_kk: `Нақтылаңыз: «${fragment}»`,
    });
  return { raw_text, items, issues, engine: "ai" };
}
