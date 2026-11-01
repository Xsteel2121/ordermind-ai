import { menu, parseOrder, validateOrder } from "../lib/parseOrder";
let passed = 0;
for (const m of menu) {
  const r = parseOrder(m.name_ru);
  if (
    r.items.length === 1 &&
    r.items[0].menu_id === m.id &&
    !validateOrder(r).length
  )
    passed++;
  else console.error("FAIL:", m.id, m.name_ru);
}
console.log(
  `Exact Coffee Boom menu coverage: ${passed}/${menu.length}. This is a catalog regression, not a measured speech or AI accuracy benchmark.`,
);
if (passed !== menu.length) process.exitCode = 1;
