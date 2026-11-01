"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  AudioLines,
  Check,
  CheckCheck,
  ChevronRight,
  CircleHelp,
  Coffee,
  CornerDownLeft,
  FileCheck2,
  Loader2,
  Mic,
  Minus,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import {
  categories,
  itemTotal,
  makeItem,
  menu,
  menuById,
  orderTotal,
  parseOrder,
  searchMenu,
  validateOrder,
} from "@/lib/parseOrder";
import type { Language, OrderEvent, OrderItem, ParsedOrder } from "@/lib/types";
import { Badge, money, type T } from "./ui";
const examples = [
  {
    label: ["Кофе и завтрак", "Кофе мен таңғы ас"],
    text: "Бір капучино 300 мл, және круассан с сёмгой",
  },
  {
    label: ["Смешанная речь", "Аралас сөйлеу"],
    text: "Екі куриных бургера, пиязсыз, и один фри",
  },
  {
    label: ["Уточнение молока", "Сүтті нақтылау"],
    text: "Бір капучино, овсяное молоко",
  },
  {
    label: ["Обед на двоих", "Екі адамға түскі ас"],
    text: "Два том яма, пицца пепперони и қазақша шай",
  },
];
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};
export default function Demo({
  t,
  lang,
  onConfirm,
}: {
  t: T;
  lang: Language;
  onConfirm: (e: OrderEvent) => void;
}) {
  const [input, setInput] = useState(""),
    [order, setOrder] = useState<ParsedOrder | null>(null),
    [busy, setBusy] = useState(false),
    [recording, setRecording] = useState(false),
    [micSupported, setMicSupported] = useState(false),
    [micError, setMicError] = useState(""),
    [speechLang, setSpeechLang] = useState("ru-RU"),
    [confirmed, setConfirmed] = useState(false),
    [elapsed, setElapsed] = useState(0),
    [picker, setPicker] = useState(false),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("all"),
    [revision, setRevision] = useState(0),
    [draftReady, setDraftReady] = useState(false),
    [edited, setEdited] = useState(false);
  const mappingIssue = useRef<string | null>(null),
    initialized = useRef(false),
    skipParse = useRef(false),
    abort = useRef<AbortController | null>(null),
    version = useRef(0),
    recognition = useRef<Recognition | null>(null),
    micTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    confirmedRef = useRef(false),
    parseTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    initialIssues = useRef(0),
    orderId = useRef(""),
    receipt = useRef<HTMLElement>(null),
    dialog = useRef<HTMLDialogElement>(null),
    textArea = useRef<HTMLTextAreaElement>(null);
  const issues = order ? validateOrder(order) : [],
    total = order ? orderTotal(order.items) : 0;
  const openCount = issues.length;
  const named = (id: string) =>
    menuById.get(id)?.[lang === "ru" ? "name_ru" : "name_kk"] ?? "";
  const stopMic = () => {
    recognition.current?.stop();
    if (micTimer.current) clearTimeout(micTimer.current);
    setRecording(false);
  };
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const w = window as unknown as {
        SpeechRecognition?: new () => Recognition;
        webkitSpeechRecognition?: new () => Recognition;
      };
      setMicSupported(!!(w.SpeechRecognition ?? w.webkitSpeechRecognition));
      let saved: {
        input: string;
        order: ParsedOrder | null;
        elapsed: number;
        initialIssues: number;
        edited: boolean;
      } | null = null;
      try {
        const raw = sessionStorage.getItem("ordermind-draft-v2");
        if (raw) {
          const d = JSON.parse(raw);
          if (
            typeof d.input === "string" &&
            d.input.length <= 1500 &&
            d.order &&
            Array.isArray(d.order.items) &&
            Array.isArray(d.order.issues) &&
            d.order.items.every(
              (i: OrderItem) =>
                typeof i.rowId === "string" &&
                Number.isInteger(i.qty) &&
                i.qty > 0 &&
                i.qty <= 20 &&
                (menuById.has(i.menu_id) ||
                  i.candidates?.every((id) => menuById.has(id))) &&
                Array.isArray(i.notes) &&
                i.notes.every(
                  (n) =>
                    typeof n.text === "string" &&
                    typeof n.reviewed === "boolean" &&
                    Number.isFinite(n.extra),
                ),
            ) &&
            Number.isFinite(d.elapsed) &&
            Number.isFinite(d.initialIssues)
          )
            saved = d;
        }
      } catch {}
      const id = new URLSearchParams(window.location.search).get("item");
      if (id && menuById.has(id)) {
        const raw = saved?.input ?? "";
        setInput(raw);
        setOrder({
          raw_text: raw,
          items: [...(saved?.order?.items ?? []), makeItem(id)],
          issues: saved?.order?.issues ?? [],
          engine: "catalog",
        });
        skipParse.current = true;
        setEdited(true);
        setElapsed(saved?.elapsed ?? 0);
        initialIssues.current = saved?.initialIssues ?? 0;
        history.replaceState(null, "", "/demo/");
      } else if (saved) {
        setInput(saved.input);
        setOrder(saved.order);
        setElapsed(saved.elapsed);
        initialIssues.current = saved.initialIssues;
        setEdited(saved.edited);
        skipParse.current = true;
      }
      setDraftReady(true);
    }
    return () => {
      abort.current?.abort();
      if (micTimer.current) clearTimeout(micTimer.current);
      if (recognition.current) {
        recognition.current.onend = null;
        recognition.current.onresult = null;
        recognition.current.onerror = null;
        recognition.current.abort();
      }
    };
  }, []);
  useEffect(() => {
    if (!draftReady) return;
    try {
      if (confirmed || (!input && !order))
        sessionStorage.removeItem("ordermind-draft-v2");
      else
        sessionStorage.setItem(
          "ordermind-draft-v2",
          JSON.stringify({
            input,
            order,
            elapsed,
            initialIssues: initialIssues.current,
            edited,
          }),
        );
    } catch {}
  }, [draftReady, input, order, elapsed, confirmed, edited]);
  useEffect(() => {
    if (!input.trim()) return;
    if (skipParse.current) {
      skipParse.current = false;
      return;
    }
    parseTimer.current = setTimeout(() => {
      const start = performance.now();
      const parsed = parseOrder(input);
      setOrder(parsed);
      initialIssues.current = validateOrder(parsed).length;
      setElapsed(Math.max(1, Math.round(performance.now() - start)));
    }, 320);
    return () => {
      if (parseTimer.current) clearTimeout(parseTimer.current);
    };
  }, [input, revision]);
  useEffect(() => {
    if (picker) dialog.current?.showModal();
    else dialog.current?.close();
  }, [picker]);
  function changeText(value: string) {
    skipParse.current = false;
    setEdited(false);
    if (parseTimer.current) clearTimeout(parseTimer.current);
    abort.current?.abort();
    version.current++;
    setBusy(false);
    setInput(value);
    setRevision((v) => v + 1);
    setOrder(null);
    setConfirmed(false);
    confirmedRef.current = false;
    orderId.current = "";
    setMicError("");
  }
  function showReceipt() {
    receipt.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
    receipt.current?.focus({ preventScroll: true });
  }
  async function analyze() {
    if (!input.trim() || busy) return;
    setEdited(false);
    if (parseTimer.current) clearTimeout(parseTimer.current);
    stopMic();
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    const requestVersion = ++version.current;
    setBusy(true);
    setConfirmed(false);
    confirmedRef.current = false;
    const started = performance.now();
    try {
      const response = await fetch("/api/parse/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
        signal: controller.signal,
      });
      if (!response.ok) throw Error("unavailable");
      const result = (await response.json()) as ParsedOrder;
      if (requestVersion !== version.current) return;
      if (!Array.isArray(result.items) || !Array.isArray(result.issues))
        throw Error("response");
      setOrder(result);
      initialIssues.current = validateOrder(result).length;
      setElapsed(Math.round(performance.now() - started));
    } catch (error) {
      if (controller.signal.aborted) return;
      const fallback = parseOrder(input);
      setOrder({ ...fallback, notice: "ai_unavailable" });
      initialIssues.current = validateOrder(fallback).length;
    } finally {
      if (requestVersion === version.current) {
        setBusy(false);
        requestAnimationFrame(showReceipt);
      }
    }
  }
  function update(rowId: string, patch: Partial<OrderItem>) {
    setEdited(true);
    setOrder((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((i) =>
              i.rowId === rowId ? { ...i, ...patch } : i,
            ),
            issues: prev.issues.filter(
              (i) => !(i.rowId === rowId && i.id.startsWith("qty-")),
            ),
          }
        : prev,
    );
  }
  function remove(rowId: string) {
    setEdited(true);
    setOrder((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.filter((i) => i.rowId !== rowId),
            issues: prev.issues.filter((i) => i.rowId !== rowId),
          }
        : prev,
    );
  }
  function add(id: string) {
    const issueId = mappingIssue.current;
    setEdited(true);
    if (parseTimer.current) clearTimeout(parseTimer.current);
    abort.current?.abort();
    version.current++;
    setBusy(false);
    setOrder((prev) => ({
      ...prev,
      raw_text: prev?.raw_text ?? input,
      issues: (prev?.issues ?? []).map((i) =>
        i.id === issueId ? { ...i, resolved: true } : i,
      ),
      engine: prev?.engine ?? "catalog",
      items: [...(prev?.items ?? []), makeItem(id)],
    }));
    mappingIssue.current = null;
    setPicker(false);
    setConfirmed(false);
    confirmedRef.current = false;
    requestAnimationFrame(showReceipt);
  }
  function confirm() {
    if (!order || confirmedRef.current || validateOrder(order).length || busy)
      return;
    confirmedRef.current = true;
    orderId.current ||= crypto.randomUUID();
    onConfirm({
      id: orderId.current,
      timestamp: new Date().toISOString(),
      raw_text: input,
      items: structuredClone(order.items),
      total: orderTotal(order.items),
      issues: initialIssues.current,
      resolved: initialIssues.current,
      modelSaved: initialIssues.current ? 2000 : 0,
      language: lang,
      processingMs: elapsed,
    });
    setConfirmed(true);
    stopMic();
  }
  function toggleMic() {
    if (recording) {
      stopMic();
      return;
    }
    const w = window as unknown as {
      SpeechRecognition?: new () => Recognition;
      webkitSpeechRecognition?: new () => Recognition;
    };
    const Constructor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Constructor) {
      setMicError(
        t(
          "В этом браузере используйте текстовый ввод.",
          "Бұл браузерде мәтін енгізіңіз.",
        ),
      );
      return;
    }
    const r = new Constructor();
    recognition.current = r;
    r.lang = speechLang;
    r.continuous = true;
    r.interimResults = true;
    const prefix = input.trim();
    r.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      changeText([prefix, transcript].filter(Boolean).join(" "));
    };
    r.onerror = (e) => {
      setRecording(false);
      setMicError(
        e.error === "not-allowed"
          ? t(
              "Доступ к микрофону закрыт. Разрешите его в настройках браузера или введите текст.",
              "Микрофонға рұқсат жоқ. Браузерде рұқсат беріңіз немесе мәтін енгізіңіз.",
            )
          : t(
              "Не удалось распознать голос. Попробуйте снова или введите текст.",
              "Дауысты тану мүмкін болмады. Қайталап көріңіз немесе мәтін енгізіңіз.",
            ),
      );
    };
    r.onend = () => {
      setRecording(false);
      if (micTimer.current) clearTimeout(micTimer.current);
    };
    try {
      r.start();
      setRecording(true);
      setMicError("");
      micTimer.current = setTimeout(() => r.stop(), 25000);
    } catch {
      setMicError(
        t(
          "Микрофон недоступен. Используйте текст.",
          "Микрофон қолжетімсіз. Мәтін енгізіңіз.",
        ),
      );
    }
  }
  const matching = searchMenu(search, category);
  return (
    <div className="page-body demo-page">
      <div className="page-heading">
        <div>
          <span className="overline">
            <span className="status-dot" />
            {t("ИНТЕРАКТИВНОЕ ДЕМО", "ИНТЕРАКТИВТІ ДЕМО")}
          </span>
          <h1>{t("Скажите. Проверим.", "Айтыңыз. Тексереміз.")}</h1>
          <p>
            {t(
              "Живая речь превращается в понятный заказ. Попробуйте на меню Coffee Boom.",
              "Табиғи сөйлеу нақты тапсырысқа айналады. Coffee Boom мәзірімен байқап көріңіз.",
            )}
          </p>
        </div>
        <Link href="/menu/" className="venue-pill">
          <Coffee size={18} />
          <span>
            <b>Coffee Boom</b>
            <small>{t("Астана · 249 позиций", "Астана · 249 өнім")}</small>
          </span>
          <ChevronRight size={16} />
        </Link>
      </div>
      <div
        className="flow-steps"
        aria-label={t("Этапы заказа", "Тапсырыс кезеңдері")}
      >
        {[
          [t("Речь гостя", "Қонақ сөзі"), !!input],
          [t("Проверка по меню", "Мәзірмен тексеру"), !!order],
          [t("Подтверждение", "Растау"), confirmed],
        ].map(([label, active], i) => (
          <div className={active ? "done" : ""} key={i}>
            <span>
              {active ? <Check size={12} /> : String(i + 1).padStart(2, "0")}
            </span>
            {label}
            {i < 2 && <ChevronRight size={14} />}
          </div>
        ))}
      </div>
      <div className="studio-grid">
        <section className="composer panel">
          <div className="composer-title">
            <span className="surface-icon">
              <AudioLines size={21} />
            </span>
            <div>
              <h2>{t("Что закажет гость?", "Қонақ не тапсырады?")}</h2>
              <p>
                {t(
                  "По-русски, қазақша или вперемешку",
                  "Орысша, қазақша немесе араластырып",
                )}
              </p>
            </div>
            <Badge>RU + KK</Badge>
          </div>
          <div
            className={`voice-stage ${recording ? "listening" : ""} ${busy ? "processing" : ""}`}
          >
            <div className="voice-grid" />
            <div className="voice-ring ring-one" />
            <div className="voice-ring ring-two" />
            <div className="voice-core">
              <AudioLines size={37} strokeWidth={1.5} />
            </div>
            <div className="sound-bars" aria-hidden="true">
              {Array.from({ length: 40 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    height: 6 + ((i * 13) % 34),
                    animationDelay: `${i * 0.06}s`,
                  }}
                />
              ))}
            </div>
            <span>
              {recording
                ? t("Слушаем гостя…", "Қонақты тыңдаймыз…")
                : busy
                  ? t("Сверяем заказ с меню…", "Тапсырысты тексереміз…")
                  : t("Готовы к вашему заказу", "Тапсырысыңызға дайынбыз")}
            </span>
            <small>
              {t(
                "249 позиций. Ни одной случайной.",
                "249 өнім. Әрқайсысы мәзірден.",
              )}
            </small>
          </div>
          <div className="compose-fields">
            <div className="label-row">
              <label htmlFor="order-input">
                {t("Фраза гостя", "Қонақтың сөзі")}
              </label>
              <span>{input.length}/1500</span>
            </div>
            <textarea
              ref={textArea}
              id="order-input"
              maxLength={1500}
              value={input}
              disabled={!draftReady || confirmed}
              onChange={(e) => changeText(e.target.value)}
              placeholder={t(
                "Например: Бір капучино 300 мл, және круассан с сёмгой",
                "Мысалы: Бір капучино 300 мл, және круассан с сёмгой",
              )}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  void analyze();
                }
              }}
            />
            <div className="input-caption">
              <span>
                <ShieldCheck size={13} />
                {t("Цены и позиции — из меню", "Баға мен өнім — мәзірден")}
              </span>
              <span className="key-hint">⌘ / Ctrl ↵</span>
            </div>
            <div className="composer-actions">
              <button
                className="button primary"
                disabled={
                  !draftReady || !input.trim() || busy || confirmed || recording
                }
                onClick={() => void analyze()}
              >
                {busy ? (
                  <Loader2 size={18} className="spin" />
                ) : (
                  <Sparkles size={18} />
                )}
                <span>
                  {busy
                    ? t("Разбираем…", "Талдауда…")
                    : edited
                      ? t("Разобрать заново", "Қайта талдау")
                      : t("Разобрать заказ", "Тапсырысты талдау")}
                </span>
                <ArrowRight size={17} />
              </button>
              <button
                className={`button mic-button ${recording ? "is-recording" : ""}`}
                onClick={toggleMic}
                disabled={!draftReady || !micSupported || busy || confirmed}
                aria-label={
                  recording
                    ? t("Остановить запись", "Жазуды тоқтату")
                    : t("Записать голос", "Дауысты жазу")
                }
              >
                {recording ? <Square size={17} /> : <Mic size={19} />}
              </button>
            </div>
            <div className="mic-meta">
              <span>
                {micSupported
                  ? t("Голос через браузер", "Браузер арқылы дауыс")
                  : t(
                      "Микрофон недоступен в этом браузере",
                      "Бұл браузерде микрофон қолжетімсіз",
                    )}
              </span>
              {micSupported && (
                <select
                  aria-label={t(
                    "Язык распознавания голоса",
                    "Дауысты тану тілі",
                  )}
                  value={speechLang}
                  disabled={recording}
                  onChange={(e) => setSpeechLang(e.target.value)}
                >
                  <option value="ru-RU">Русский</option>
                  <option value="kk-KZ">Қазақша</option>
                </select>
              )}
            </div>
            {edited && (
              <p className="edited-hint">
                {t(
                  "Чек отредактирован. Повторный разбор заменит внесённые правки.",
                  "Чек өзгертілді. Қайта талдау енгізілген түзетулерді ауыстырады.",
                )}
              </p>
            )}
            {micError && (
              <p className="inline-alert" role="alert">
                {micError}
              </p>
            )}
            <AnimatePresence>
              {order && !confirmed && (
                <motion.button
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="recognition-link"
                  onClick={showReceipt}
                >
                  <span>
                    <CheckCheck size={17} />
                    {order.items.length
                      ? t(
                          `Найдено: ${order.items.length} · ${openCount ? "есть уточнения" : "готово к проверке"}`,
                          `Табылды: ${order.items.length} · ${openCount ? "нақтылау керек" : "тексеруге дайын"}`,
                        )
                      : t(
                          "Нужно уточнение по меню",
                          "Мәзір бойынша нақтылау керек",
                        )}
                  </span>
                  <ArrowDown size={17} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </section>
        <section
          ref={receipt}
          tabIndex={-1}
          className={`receipt panel ${confirmed ? "is-confirmed" : ""}`}
          id="order-receipt"
        >
          <div className="receipt-heading">
            <div>
              <ReceiptText size={19} />
              <h2>{t("Ваш заказ", "Сіздің тапсырысыңыз")}</h2>
            </div>
            <span className="mono">COFFEE BOOM</span>
          </div>
          <AnimatePresence mode="wait">
            {confirmed ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="success-state"
              >
                <div className="success-check">
                  <CheckCheck size={36} />
                </div>
                <Badge green>
                  {t("Заказ подтверждён", "Тапсырыс расталды")}
                </Badge>
                <h2>{t("Всё на своих местах.", "Бәрі өз орнында.")}</h2>
                <p>
                  {t(
                    "Состав и сумма сохранены в журнале.",
                    "Құрамы мен сомасы журналда сақталды.",
                  )}
                </p>
                <strong>{money(total)}</strong>
                <div className="success-lines">
                  {order?.items.map((i) => (
                    <span key={i.rowId}>
                      <b>
                        {i.qty} × {named(i.menu_id)}
                      </b>
                      <small>{money(itemTotal(i))}</small>
                    </span>
                  ))}
                </div>
                <button
                  className="button primary full"
                  onClick={() => {
                    changeText("");
                    requestAnimationFrame(() => textArea.current?.focus());
                  }}
                >
                  {t("Следующий заказ", "Келесі тапсырыс")}
                  <ArrowRight size={18} />
                </button>
                <Link href="/analytics/" className="text-link">
                  {t("Посмотреть в журнале", "Журналдан көру")}
                  <ChevronRight size={15} />
                </Link>
                <small className="simulation-note">
                  {t(
                    "Демо-заказ · в кассу и на кухню не отправляется",
                    "Демо тапсырыс · касса мен асүйге жіберілмейді",
                  )}
                </small>
              </motion.div>
            ) : (
              <motion.div
                key="editing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="receipt-body"
              >
                {order?.items.length ? (
                  <>
                    <div
                      className={`order-health ${openCount ? "needs-review" : "ready"}`}
                      role="status"
                    >
                      {openCount ? (
                        <CircleHelp size={19} />
                      ) : (
                        <ShieldCheck size={19} />
                      )}
                      <div>
                        <strong>
                          {openCount
                            ? t("Уточним детали", "Мәліметтерді нақтылайық")
                            : t("Можно подтверждать", "Растауға болады")}
                        </strong>
                        <span>
                          {openCount
                            ? t(
                                "Найденные позиции сохранены ниже",
                                "Табылған өнімдер төменде сақталды",
                              )
                            : t(
                                "Все позиции есть в Coffee Boom",
                                "Барлық өнім Coffee Boom мәзірінде бар",
                              )}
                        </span>
                      </div>
                      <span className="health-count">
                        {openCount || <Check size={16} />}
                      </span>
                    </div>
                    <div className="receipt-items">
                      {order.items.map((item, index) => {
                        const product = menuById.get(item.menu_id);
                        return (
                          <motion.article
                            layout="position"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="receipt-item"
                            key={item.rowId}
                          >
                            <div className="receipt-item-head">
                              <span className="item-number">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <div>
                                <h3>
                                  {product ? named(item.menu_id) : item.mention}
                                </h3>
                                <span>
                                  {product
                                    ? `${product.serving} · ${money(product.price)}`
                                    : t(
                                        "Выберите вариант из меню",
                                        "Мәзірден нұсқаны таңдаңыз",
                                      )}
                                </span>
                              </div>
                              <button
                                className="icon-button remove-item"
                                aria-label={t(
                                  "Удалить позицию",
                                  "Өнімді алып тастау",
                                )}
                                disabled={busy}
                                onClick={() => remove(item.rowId)}
                              >
                                <X size={16} />
                              </button>
                            </div>
                            {item.candidates?.length && (
                              <div
                                className="variant-options"
                                role="group"
                                aria-label={t(
                                  "Вариант позиции",
                                  "Өнім нұсқасы",
                                )}
                              >
                                {item.candidates.map((id) => {
                                  const m = menuById.get(id)!;
                                  return (
                                    <button
                                      disabled={busy}
                                      key={id}
                                      onClick={() =>
                                        update(item.rowId, {
                                          menu_id: id,
                                          candidates: undefined,
                                        })
                                      }
                                    >
                                      <span>
                                        <b>{named(id)}</b>
                                        <small>{m.serving}</small>
                                      </span>
                                      <strong>{money(m.price)}</strong>
                                      <Plus size={15} />
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                            {!!item.notes?.length && (
                              <div className="order-notes">
                                {item.notes.map((note, ni) => (
                                  <div
                                    className={`order-note ${note.reviewed ? "reviewed" : ""}`}
                                    key={`${note.text}-${ni}`}
                                  >
                                    <div>
                                      <span>
                                        {note.reviewed ? (
                                          <Check size={13} />
                                        ) : (
                                          <CircleHelp size={13} />
                                        )}
                                        <b>{note.text}</b>
                                      </span>
                                      <button
                                        disabled={busy}
                                        aria-label={t(
                                          "Убрать пожелание",
                                          "Тілекті алып тастау",
                                        )}
                                        onClick={() =>
                                          update(item.rowId, {
                                            notes: item.notes!.filter(
                                              (_, i) => i !== ni,
                                            ),
                                          })
                                        }
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                    {!note.reviewed ? (
                                      <>
                                        <p>
                                          {t(
                                            "В PDF нет условий этой добавки. Уточните у гостя и сотрудника.",
                                            "PDF-те бұл қоспаның шарттары жоқ. Қонақ пен қызметкерден нақтылаңыз.",
                                          )}
                                        </p>
                                        <div className="note-review">
                                          <label>
                                            {t(
                                              "Доплата за 1 шт.",
                                              "1 данаға қосымша ақы",
                                            )}
                                            <span>
                                              <input
                                                type="number"
                                                min="0"
                                                max="50000"
                                                step="50"
                                                aria-label={`${t("Доплата", "Қосымша ақы")}: ${note.text}`}
                                                disabled={busy}
                                                value={note.extra}
                                                onChange={(e) =>
                                                  update(item.rowId, {
                                                    notes: item.notes!.map(
                                                      (n, i) =>
                                                        i === ni
                                                          ? {
                                                              ...n,
                                                              extra: Math.max(
                                                                0,
                                                                Math.min(
                                                                  50000,
                                                                  Number(
                                                                    e.target
                                                                      .value,
                                                                  ) || 0,
                                                                ),
                                                              ),
                                                            }
                                                          : n,
                                                    ),
                                                  })
                                                }
                                              />
                                              <small>₸</small>
                                            </span>
                                          </label>
                                          <button
                                            disabled={busy}
                                            onClick={() =>
                                              update(item.rowId, {
                                                notes: item.notes!.map(
                                                  (n, i) =>
                                                    i === ni
                                                      ? { ...n, reviewed: true }
                                                      : n,
                                                ),
                                              })
                                            }
                                          >
                                            <Check size={14} />
                                            {t("Уточнено", "Нақтыланды")}
                                          </button>
                                        </div>
                                      </>
                                    ) : (
                                      <small>
                                        {note.extra
                                          ? `+ ${money(note.extra)} / ${t("шт.", "дана")}`
                                          : t(
                                              "Без доплаты · подтверждено сотрудником",
                                              "Қосымша ақысыз · қызметкер растады",
                                            )}
                                      </small>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {issues
                              .filter(
                                (i) =>
                                  i.rowId === item.rowId &&
                                  ["conflict", "unsupported"].includes(i.kind),
                              )
                              .map((i) => (
                                <p className="inline-alert" key={i.id}>
                                  {lang === "ru" ? i.message_ru : i.message_kk}
                                </p>
                              ))}
                            <div className="receipt-item-foot">
                              <div className="quantity">
                                <button
                                  disabled={busy || item.qty <= 1}
                                  aria-label={t(
                                    "Уменьшить количество",
                                    "Санын азайту",
                                  )}
                                  onClick={() =>
                                    update(item.rowId, { qty: item.qty - 1 })
                                  }
                                >
                                  <Minus size={14} />
                                </button>
                                <span>{item.qty}</span>
                                <button
                                  disabled={busy || item.qty >= 20}
                                  aria-label={t(
                                    "Увеличить количество",
                                    "Санын көбейту",
                                  )}
                                  onClick={() =>
                                    update(item.rowId, { qty: item.qty + 1 })
                                  }
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <strong>
                                {product
                                  ? money(itemTotal(item))
                                  : t("уточните вариант", "нұсқаны таңдаңыз")}
                              </strong>
                            </div>
                          </motion.article>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="receipt-empty">
                    <div className="empty-ticket">
                      <ReceiptText size={31} />
                      <i />
                      <i />
                      <i />
                    </div>
                    <h3>
                      {t(
                        "Здесь появится точный заказ",
                        "Нақты тапсырыс осында көрінеді",
                      )}
                    </h3>
                    <p>
                      {t(
                        "Введите фразу, выберите пример или добавьте блюдо из меню.",
                        "Сөздерді енгізіңіз, мысал таңдаңыз немесе мәзірден тағам қосыңыз.",
                      )}
                    </p>
                  </div>
                )}
                {order?.issues
                  .filter((i) => !i.rowId && !i.resolved)
                  .map((i) => (
                    <div className="unmatched-card" key={i.id}>
                      <CircleHelp size={18} />
                      <div>
                        <strong>
                          {lang === "ru" ? i.message_ru : i.message_kk}
                        </strong>
                        <p>
                          {t(
                            "Попробуйте разбор, исправьте текст или выберите блюдо в меню.",
                            "Талдауды байқап көріңіз, мәтінді түзетіңіз немесе мәзірден тағам таңдаңыз.",
                          )}
                        </p>
                        <div className="unmatched-actions">
                          <button
                            onClick={() => {
                              mappingIssue.current = i.id;
                              setSearch("");
                              setCategory("all");
                              setPicker(true);
                            }}
                            disabled={busy}
                          >
                            {t("Сопоставить с меню", "Мәзірмен сәйкестендіру")}
                          </button>
                          <button
                            onClick={() =>
                              setOrder((p) =>
                                p
                                  ? {
                                      ...p,
                                      issues: p.issues.map((x) =>
                                        x.id === i.id
                                          ? { ...x, resolved: true }
                                          : x,
                                      ),
                                    }
                                  : p,
                              )
                            }
                            disabled={busy || !order.items.length}
                          >
                            {t(
                              "Гость подтвердил состав выше",
                              "Қонақ жоғарыдағы құрамды растады",
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                <button
                  className="add-from-menu"
                  disabled={!draftReady || busy}
                  onClick={() => {
                    mappingIssue.current = null;
                    setSearch("");
                    setCategory("all");
                    setPicker(true);
                  }}
                >
                  <Plus size={17} />
                  {t("Добавить из меню", "Мәзірден қосу")}
                  <span>249</span>
                </button>
                <div className="receipt-total">
                  <span>
                    {t("Итого по меню", "Мәзір бойынша барлығы")}
                    <small>
                      {order?.items.some((i) => !i.menu_id)
                        ? t(
                            "Сумма выбранных позиций",
                            "Таңдалған өнімдер сомасы",
                          )
                        : t(
                            "С учётом подтверждённых добавок",
                            "Расталған қоспалармен бірге",
                          )}
                    </small>
                  </span>
                  <strong>{money(total)}</strong>
                </div>
                <button
                  className="button primary full confirm-order"
                  disabled={
                    !order?.items.length || openCount > 0 || busy || recording
                  }
                  onClick={confirm}
                >
                  <CheckCheck size={18} />
                  {t("Подтвердить заказ", "Тапсырысты растау")}
                  <ArrowRight size={17} />
                </button>
                <p className="receipt-footnote">
                  {openCount && order?.items.length
                    ? t(
                        "Сначала уточните выделенные детали.",
                        "Алдымен белгіленген мәліметтерді нақтылаңыз.",
                      )
                    : t(
                        "Сотрудник проверяет и подтверждает каждый заказ.",
                        "Қызметкер әр тапсырысты тексеріп, растайды.",
                      )}
                </p>
                {order && (
                  <div className="engine-caption">
                    <span className="status-dot" />
                    {order.engine === "ai"
                      ? t("ИИ + проверка каталога", "ЖИ + каталогты тексеру")
                      : t("Подбор по каталогу", "Каталог бойынша іздеу")}
                    <span>
                      {elapsed < 1000
                        ? `${elapsed} ms`
                        : `${(elapsed / 1000).toFixed(1)} s`}
                    </span>
                  </div>
                )}
                {order?.notice && (
                  <p className="fallback-notice" role="status">
                    {order.notice === "rate_limited"
                      ? t(
                          "Пауза между ИИ-запросами. Поиск и ручной выбор работают.",
                          "ЖИ сұраулары арасында үзіліс. Іздеу мен қолмен таңдау жұмыс істейді.",
                        )
                      : t(
                          "ИИ сейчас недоступен. Заказ разобран по словарю меню; оставшиеся детали можно уточнить вручную.",
                          "ЖИ қазір қолжетімсіз. Тапсырыс мәзір сөздігімен талданды; қалғанын қолмен нақтылауға болады.",
                        )}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
        <section className="scenario-section">
          <div className="section-label">
            <span>{t("НАЧНИТЕ С ПРИМЕРА", "МЫСАЛДАН БАСТАҢЫЗ")}</span>
            <CornerDownLeft size={15} />
          </div>
          <div className="scenario-grid">
            {examples.map((e, i) => (
              <button
                key={e.text}
                disabled={!draftReady}
                onClick={() => {
                  stopMic();
                  changeText(e.text);
                }}
                className={input === e.text ? "selected" : ""}
              >
                <span>
                  <b>{e.label[lang === "ru" ? 0 : 1]}</b>
                  <ArrowRight size={15} />
                </span>
                <p>«{e.text}»</p>
                <small>0{i + 1} / RU + KK</small>
              </button>
            ))}
          </div>
          <div className="demo-bottom-note">
            <ShieldCheck size={17} />
            <p>
              {t(
                "Меню доставки Coffee Boom, Астана, от 18.09.2026. Цены в зале могут отличаться. Демо не отправляет заказы в кассу.",
                "Coffee Boom жеткізу мәзірі, Астана, 18.09.2026. Залдағы бағалар өзгеше болуы мүмкін. Демо тапсырысты кассаға жібермейді.",
              )}
            </p>
          </div>
        </section>
      </div>
      <dialog
        ref={dialog}
        className="menu-picker"
        onCancel={() => setPicker(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setPicker(false);
        }}
      >
        <div className="picker-surface">
          <div className="picker-header">
            <div>
              <span className="overline">COFFEE BOOM · АСТАНА</span>
              <h2>{t("Добавить в заказ", "Тапсырысқа қосу")}</h2>
            </div>
            <button
              className="icon-button"
              onClick={() => setPicker(false)}
              aria-label={t("Закрыть каталог", "Каталогты жабу")}
            >
              <X size={22} />
            </button>
          </div>
          <label className="search-field">
            <Search size={18} />
            <input
              autoFocus
              aria-label={t("Поиск блюда", "Тағам іздеу")}
              placeholder={t(
                "Капучино, том ям, бауырсақ…",
                "Капучино, том ям, бауырсақ…",
              )}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select
            className="picker-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label={t("Категория блюда", "Тағам санаты")}
          >
            <option value="all">{t("Все категории", "Барлық санаттар")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {lang === "ru" ? c.name_ru : c.name_kk}
              </option>
            ))}
          </select>
          <div className="picker-results">
            {matching.map((m) => (
              <button key={m.id} onClick={() => add(m.id)}>
                <span
                  className={`product-symbol ${m.serving.endsWith("мл") ? "beverage" : ""}`}
                >
                  {m.serving.endsWith("мл") ? (
                    <Coffee size={20} />
                  ) : (
                    <UtensilsCrossed size={20} />
                  )}
                </span>
                <span>
                  <b>{named(m.id)}</b>
                  <small>{m.serving}</small>
                </span>
                <strong>{money(m.price)}</strong>
                <Plus size={17} />
              </button>
            ))}
            {!matching.length && (
              <div className="journal-empty">
                <Search size={28} />
                <p>
                  {t(
                    "Нет такого блюда. Попробуйте другое название.",
                    "Бұл тағам жоқ. Басқа атауды байқап көріңіз.",
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </div>
  );
}
