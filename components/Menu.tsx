"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Coffee,
  Plus,
  Search,
  SlidersHorizontal,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { categories, menu, searchMenu } from "@/lib/parseOrder";
import type { Language } from "@/lib/types";
import { money, type T } from "./ui";
export default function Menu({ t, lang }: { t: T; lang: Language }) {
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("all"),
    [limit, setLimit] = useState(36);
  const items = searchMenu(search, category);
  const selected = categories.find((c) => c.id === category);
  return (
    <div className="page-body catalog-page">
      <div className="page-heading">
        <div>
          <span className="overline">
            {t("ЕДИНЫЙ ИСТОЧНИК МЕНЮ", "БІРЫҢҒАЙ МӘЗІР")}
          </span>
          <h1>
            Coffee Boom<span className="heading-period">.</span>
          </h1>
          <p>
            {t(
              "Астана. От утреннего кофе до ужина — всё в одном каталоге.",
              "Астана. Таңғы кофеден кешкі асқа дейін — бір каталогта.",
            )}
          </p>
        </div>
        <div className="catalog-counter">
          <strong>249</strong>
          <span>
            {t("позиций", "өнім")}
            <br />
            {t("в 23 категориях", "23 санатта")}
          </span>
        </div>
      </div>
      <div className="catalog-intro">
        <BookOpen size={20} />
        <p>
          {t(
            "Меню доставки из вашего PDF · обновлено 18 сентября 2026. В зале и других филиалах цены могут отличаться. Дополнительные опции в источнике не указаны.",
            "PDF-тегі жеткізу мәзірі · 2026 жылғы 18 қыркүйек. Зал мен басқа филиалдардағы бағалар өзгеше болуы мүмкін. Қосымша опциялар деректе көрсетілмеген.",
          )}
        </p>
        <span>₸ KZT</span>
      </div>
      <div className="catalog-controls">
        <label className="search-field">
          <Search size={19} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setLimit(36);
            }}
            placeholder={t(
              "Найти блюдо, напиток или синоним…",
              "Тағамды, сусынды немесе синонимді табу…",
            )}
            aria-label={t("Поиск в меню", "Мәзірден іздеу")}
          />
          {search && (
            <button
              className="icon-button"
              onClick={() => setSearch("")}
              aria-label={t("Очистить поиск", "Іздеуді тазалау")}
            >
              <X size={17} />
            </button>
          )}
        </label>
        <label className="category-select">
          <SlidersHorizontal size={17} />
          <select
            aria-label={t("Категория", "Санат")}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setLimit(36);
            }}
          >
            <option value="all">{t("Все категории", "Барлық санаттар")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {lang === "ru" ? c.name_ru : c.name_kk}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="category-chips">
        <button
          className={category === "all" ? "active" : ""}
          onClick={() => {
            setCategory("all");
            setLimit(36);
          }}
        >
          {t("Всё меню", "Барлық мәзір")}
          <span>249</span>
        </button>
        {categories.map((c) => (
          <button
            className={category === c.id ? "active" : ""}
            key={c.id}
            onClick={() => {
              setCategory(c.id);
              setLimit(36);
            }}
          >
            {lang === "ru" ? c.name_ru : c.name_kk}
            <span>{menu.filter((m) => m.category === c.id).length}</span>
          </button>
        ))}
      </div>
      <div className="catalog-list-heading">
        <h2>
          {selected
            ? lang === "ru"
              ? selected.name_ru
              : selected.name_kk
            : t("Откройте своё любимое", "Сүйікті тағамыңызды табыңыз")}
        </h2>
        <span>
          {items.length} {t("позиций", "өнім")}
        </span>
      </div>
      <div className="product-grid">
        {items.slice(0, limit).map((m, i) => (
          <motion.article
            key={m.id}
            className="product-card"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              duration: 0.3,
              delay: Math.min((i % 3) * 0.045, 0.1),
            }}
          >
            <div className={`product-art cat-${m.category}`}>
              <span className="product-category">
                {
                  categories.find((c) => c.id === m.category)?.[
                    lang === "ru" ? "name_ru" : "name_kk"
                  ]
                }
              </span>
              {m.serving.endsWith("мл") ? (
                <Coffee size={58} strokeWidth={1} />
              ) : (
                <UtensilsCrossed size={48} strokeWidth={1} />
              )}
              <span className="product-serving">{m.serving}</span>
              <div className="art-orbit" />
            </div>
            <div className="product-info">
              <h3>{m[lang === "ru" ? "name_ru" : "name_kk"]}</h3>
              <div>
                <strong>{money(m.price)}</strong>
                <Link
                  aria-label={t(`Добавить ${m.name_ru}`, `${m.name_kk} қосу`)}
                  className="product-add"
                  href={`/demo/?item=${m.id}`}
                >
                  <Plus size={19} />
                </Link>
              </div>
              <details>
                <summary>
                  {t("Как можно заказать", "Қалай тапсырыс беруге болады")}
                </summary>
                <p>{m.aliases.slice(0, 6).join(" · ")}</p>
              </details>
            </div>
          </motion.article>
        ))}
      </div>
      {!items.length && (
        <div className="journal-empty">
          <Search size={30} />
          <h3>{t("Пока ничего не найдено", "Әзірге ештеңе табылмады")}</h3>
          <p>
            {t(
              "Проверьте название или сбросьте категорию.",
              "Атауды тексеріңіз немесе санатты қалпына келтіріңіз.",
            )}
          </p>
          <button
            className="button secondary"
            onClick={() => {
              setSearch("");
              setCategory("all");
            }}
          >
            {t("Показать всё", "Барлығын көрсету")}
          </button>
        </div>
      )}
      {items.length > limit && (
        <button
          className="button secondary load-more"
          onClick={() => setLimit((l) => l + 36)}
        >
          {t("Показать ещё", "Тағы көрсету")}
          <Plus size={17} />
        </button>
      )}
      <div className="catalog-footer">
        <p>
          {t(
            "Названия блюд сохранены как в исходном меню.",
            "Тағам атаулары түпнұсқа мәзірдегідей сақталған.",
          )}
        </p>
        <Link href="/demo/">
          {t("Попробовать заказ голосом", "Дауыспен тапсырыс беру")}
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
