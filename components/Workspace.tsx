"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  AudioLines,
  BarChart3,
  Calculator,
  ChevronRight,
  CircleHelp,
  Coffee,
  LayoutGrid,
  Moon,
  Sun,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { MotionConfig, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Overview from "./Overview";
const Demo = dynamic(() => import("./Demo"));
const Analytics = dynamic(() => import("./Analytics"));
const Economics = dynamic(() => import("./Economics"));
const Menu = dynamic(() => import("./Menu"));
import { Logo, money } from "./ui";
import { baseEconomics, type EconomicsInput } from "@/lib/economics";
import type { Language, OrderEvent, View } from "@/lib/types";
const paths: Record<View, string> = {
  overview: "/",
  demo: "/demo/",
  analytics: "/analytics/",
  economics: "/economics/",
  menu: "/menu/",
};
const storageKey = "ordermind-coffeeboom-v2";
function validEvents(value: unknown): value is OrderEvent[] {
  return (
    Array.isArray(value) &&
    value.every(
      (e) =>
        typeof e === "object" &&
        e &&
        typeof e.id === "string" &&
        Number.isFinite(Date.parse(e.timestamp)) &&
        typeof e.raw_text === "string" &&
        ["total", "issues", "resolved", "modelSaved", "processingMs"].every(
          (k) => Number.isFinite(e[k]) && e[k] >= 0,
        ) &&
        ["ru", "kk"].includes(e.language) &&
        Array.isArray(e.items) &&
        e.items.every(
          (i: Record<string, unknown>) =>
            i &&
            typeof i.rowId === "string" &&
            typeof i.menu_id === "string" &&
            Number.isInteger(i.qty) &&
            Number(i.qty) > 0 &&
            Number(i.qty) <= 20 &&
            typeof i.mods === "object" &&
            i.mods !== null &&
            Object.values(i.mods).every((v) => typeof v === "string"),
        ),
    )
  );
}
export default function Workspace() {
  const pathname = usePathname();
  const view: View =
    pathname.startsWith("/demo") || pathname.startsWith("/staff")
      ? "demo"
      : pathname.startsWith("/analytics") || pathname.startsWith("/report")
        ? "analytics"
        : pathname.startsWith("/economics")
          ? "economics"
          : pathname.startsWith("/menu")
            ? "menu"
            : "overview";
  const [lang, setLang] = useState<Language>("ru"),
    [dark, setDark] = useState(false),
    [events, setEvents] = useState<OrderEvent[]>([]),
    [economics, setEconomics] = useState<EconomicsInput>(baseEconomics),
    [ready, setReady] = useState(false),
    [storageError, setStorageError] = useState(false);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  const help = useRef<HTMLDialogElement>(null);
  const t = (ru: string, kk: string) => (lang === "ru" ? ru : kk);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const stored = JSON.parse(raw);
        if (["ru", "kk"].includes(stored.lang)) setLang(stored.lang);
        if (typeof stored.dark === "boolean") setDark(stored.dark);
        if (validEvents(stored.events)) setEvents(stored.events);
        if (
          stored.economics &&
          Object.keys(baseEconomics).every(
            (k) =>
              Number.isFinite(stored.economics[k]) && stored.economics[k] >= 0,
          ) &&
          stored.economics.days >= 1 &&
          stored.economics.days <= 31 &&
          stored.economics.errorRate <= 100 &&
          stored.economics.reduction <= 100 &&
          stored.economics.successFee <= 100
        )
          setEconomics(stored.economics);
      }
    } catch {
      setStorageError(true);
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ lang, dark, events, economics }),
      );
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [ready, lang, dark, events, economics]);
  const navigation = [
    { id: "overview" as const, ru: "Обзор", kk: "Шолу", icon: LayoutGrid },
    { id: "demo" as const, ru: "Демо", kk: "Демо", icon: AudioLines },
    { id: "menu" as const, ru: "Меню", kk: "Мәзір", icon: UtensilsCrossed },
    {
      id: "analytics" as const,
      ru: "Аналитика",
      kk: "Талдау",
      icon: BarChart3,
    },
    {
      id: "economics" as const,
      ru: "Экономика",
      kk: "Экономика",
      icon: Calculator,
    },
  ];
  const nav = navigation.find((n) => n.id === view)!;
  const saved = events.reduce((s, e) => s + e.modelSaved, 0);
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main-content">
        {t("К содержимому", "Мазмұнға өту")}
      </a>
      <div className="app-shell">
        <aside className="sidebar">
          <Link href="/" className="brand">
            <Logo />
            <span>
              OrderMind<span className="brand-ai">AI</span>
            </span>
          </Link>
          <div className="workspace-switch">
            <span className="workspace-avatar">
              <Coffee size={20} />
            </span>
            <div>
              <b>Coffee Boom</b>
              <small>{t("Астана · демо-точка", "Астана · демо орын")}</small>
            </div>
            <span className="status-dot" />
          </div>
          <div className="nav-label">
            {t("РАБОЧЕЕ ПРОСТРАНСТВО", "ЖҰМЫС КЕҢІСТІГІ")}
          </div>
          <nav aria-label={t("Основная навигация", "Негізгі навигация")}>
            {navigation.map((n) => (
              <Link
                key={n.id}
                href={paths[n.id]}
                aria-current={view === n.id ? "page" : undefined}
                className={view === n.id ? "active" : ""}
              >
                {view === n.id && (
                  <motion.span
                    layoutId="nav-active"
                    className="nav-highlight"
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  />
                )}
                <n.icon size={19} />
                <span>{t(n.ru, n.kk)}</span>
                {n.id === "demo" && <small className="nav-live">LIVE</small>}
              </Link>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="sidebar-insight">
              <span>
                <span className="status-dot" />
                {t("ЭФФЕКТ ДЕМО", "ДЕМО ӘСЕРІ")}
              </span>
              <strong>{money(saved)}</strong>
              <p>
                {t(
                  "Расчёт по вашим исправлениям",
                  "Түзетулеріңіз бойынша есеп",
                )}
              </p>
              <Link href="/analytics/">
                {t("Открыть журнал", "Журналды ашу")}
                <ArrowUpRight size={15} />
              </Link>
            </div>
            <button
              className="sidebar-help"
              onClick={() => help.current?.showModal()}
            >
              <CircleHelp size={18} />
              {t("Как это работает", "Қалай жұмыс істейді")}
            </button>
            <div className="sidebar-location">
              <span>KZ</span>
              {t("Сделано для Казахстана", "Қазақстан үшін жасалған")}
              <small>2.0</small>
            </div>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <Link href="/" className="mobile-brand">
              <Logo />
              <b>OrderMind</b>
            </Link>
            <div className="breadcrumbs">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <strong>{t(nav.ru, nav.kk)}</strong>
            </div>
            <div className="topbar-actions">
              <span className="competition">
                <span className="status-dot" />
                Мен кәсіпкермін
              </span>
              <div
                className="language-switch"
                aria-label={t("Язык интерфейса", "Интерфейс тілі")}
              >
                <button
                  className={lang === "ru" ? "active" : ""}
                  aria-pressed={lang === "ru"}
                  onClick={() => setLang("ru")}
                >
                  RU
                </button>
                <button
                  className={lang === "kk" ? "active" : ""}
                  aria-pressed={lang === "kk"}
                  onClick={() => setLang("kk")}
                >
                  KK
                </button>
              </div>
              <button
                className="theme-toggle icon-button"
                onClick={() => setDark(!dark)}
                aria-label={
                  dark
                    ? t("Светлая тема", "Ашық тақырып")
                    : t("Тёмная тема", "Қараңғы тақырып")
                }
              >
                {dark ? <Sun size={19} /> : <Moon size={19} />}
              </button>
              <button
                className="mobile-help icon-button"
                onClick={() => help.current?.showModal()}
                aria-label={t("Помощь", "Көмек")}
              >
                <CircleHelp size={19} />
              </button>
            </div>
          </header>
          <main id="main-content" tabIndex={-1}>
            {storageError && (
              <div className="storage-alert" role="status">
                {t(
                  "Браузер не сохранил данные. Экспортируйте журнал перед закрытием.",
                  "Браузер деректерді сақтай алмады. Жабар алдында журналды экспорттаңыз.",
                )}
              </div>
            )}
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {view === "overview" ? (
                <Overview t={t} />
              ) : view === "demo" ? (
                <Demo
                  t={t}
                  lang={lang}
                  onConfirm={(e) =>
                    setEvents((old) =>
                      old.some((x) => x.id === e.id) ? old : [...old, e],
                    )
                  }
                />
              ) : view === "analytics" ? (
                <Analytics
                  t={t}
                  lang={lang}
                  events={events}
                  onClear={() => setEvents([])}
                />
              ) : view === "economics" ? (
                <Economics t={t} value={economics} onChange={setEconomics} />
              ) : (
                <Menu t={t} lang={lang} />
              )}
            </motion.div>
          </main>
        </div>
        <nav
          className="mobile-nav"
          aria-label={t("Навигация телефона", "Телефон навигациясы")}
        >
          {navigation.map((n) => (
            <Link
              key={n.id}
              href={paths[n.id]}
              className={view === n.id ? "active" : ""}
              aria-current={view === n.id ? "page" : undefined}
            >
              <n.icon size={21} />
              <span>{t(n.ru, n.kk)}</span>
              {view === n.id && <motion.i layoutId="mobile-active" />}
            </Link>
          ))}
        </nav>
      </div>
      <dialog className="help-dialog" ref={help}>
        <div className="help-content">
          <button
            autoFocus
            className="icon-button modal-close"
            onClick={() => help.current?.close()}
            aria-label={t("Закрыть", "Жабу")}
          >
            <X size={21} />
          </button>
          <span className="overline">ORDERMIND / COFFEE BOOM</span>
          <h2>{t("Демо за одну минуту", "Бір минуттық демо")}</h2>
          <ol>
            <li>
              {t(
                "Введите заказ или выберите пример. Каталог сразу покажет найденные блюда.",
                "Тапсырысты енгізіңіз немесе мысал таңдаңыз. Каталог табылған тағамдарды көрсетеді.",
              )}
            </li>
            <li>
              {t(
                "«Разобрать заказ» подключает ИИ для сложных фраз. Если он недоступен, остаются поиск и ручной выбор.",
                "Күрделі сөздер үшін «Тапсырысты талдау» ЖИ-ді қосады. Ол қолжетімсіз болса, іздеу мен қолмен таңдау қалады.",
              )}
            </li>
            <li>
              {t(
                "Выберите вариант блюда и уточните пожелания с сотрудником. Доплата указывается за одну порцию.",
                "Тағам нұсқасын таңдап, тілектерді қызметкермен нақтылаңыз. Қосымша ақы бір порцияға көрсетіледі.",
              )}
            </li>
            <li>
              {t(
                "Подтвердите заказ. Он появится в журнале этого браузера.",
                "Тапсырысты растаңыз. Ол осы браузердің журналында көрінеді.",
              )}
            </li>
          </ol>
          <div className="help-note">
            {t(
              "Голос зависит от браузера и выбранного языка. Названия и цены взяты из PDF меню доставки от 18.09.2026. Касса не подключена. Экономия в аналитике — расчётная модель.",
              "Дауыс браузер мен таңдалған тілге байланысты. Атаулар мен бағалар 18.09.2026 жеткізу мәзірінің PDF файлынан алынған. Касса қосылмаған. Талдаудағы үнем — есептік модель.",
            )}
          </div>
          <Link
            href="/demo/"
            onClick={() => help.current?.close()}
            className="button primary full"
          >
            {t("Попробовать", "Байқап көру")}
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </dialog>
    </MotionConfig>
  );
}
