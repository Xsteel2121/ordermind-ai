"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  CheckCheck,
  Download,
  ShieldCheck,
  Wallet,
  Trash2,
} from "lucide-react";
import { menu } from "@/lib/parseOrder";
import type { Language, OrderEvent } from "@/lib/types";
import { Badge, Metric, money, number, type T } from "./ui";
import { downloadFile } from "./Economics";
export default function Analytics({
  t,
  lang,
  events,
  onClear,
}: {
  t: T;
  lang: Language;
  events: OrderEvent[];
  onClear: () => void;
}) {
  const [filter, setFilter] = useState("all"),
    [range, setRange] = useState("30"),
    [reset, setReset] = useState(false);
  const all = useMemo(
    () =>
      events.filter(
        (e) =>
          range === "all" ||
          Date.now() - new Date(e.timestamp).getTime() <
            Number(range) * 86400000,
      ),
    [events, range],
  );
  const filtered = all.filter(
    (e) =>
      filter === "all" ||
      (filter === "corrected" ? e.issues > 0 : e.issues === 0),
  );
  const saved = all.reduce((s, e) => s + e.modelSaved, 0),
    corrected = all.filter((e) => e.issues > 0).length,
    checks = all.reduce((s, e) => s + e.issues, 0);
  const bars = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 86400000);
    const key = date.toLocaleDateString("en-CA", { timeZone: "Asia/Almaty" });
    const dayEvents = all.filter(
      (e) =>
        new Date(e.timestamp).toLocaleDateString("en-CA", {
          timeZone: "Asia/Almaty",
        }) === key,
    );
    return {
      label: date.toLocaleDateString(lang === "ru" ? "ru-RU" : "kk-KZ", {
        weekday: "short",
        timeZone: "Asia/Almaty",
      }),
      count: dayEvents.length,
      corrected: dayEvents.filter((e) => e.issues > 0).length,
    };
  });
  const max = Math.max(1, ...bars.map((b) => b.count));
  return (
    <div className="page-body">
      <div className="page-heading">
        <div>
          <span className="overline">
            {t("АНАЛИТИКА И ЖУРНАЛ", "ТАЛДАУ ЖӘНЕ ЖУРНАЛ")}
          </span>
          <h1>{t("Результат каждого исправления", "Әр түзетудің нәтижесі")}</h1>
          <p>
            {t(
              "Ваши подтверждённые демо-заказы. Данные хранятся в этом браузере.",
              "Сіз растаған демо тапсырыстар. Деректер осы браузерде сақталады.",
            )}
          </p>
        </div>
        <div className="header-actions">
          <select
            className="standalone-select"
            aria-label={t("Период", "Кезең")}
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="7">{t("7 дней", "7 күн")}</option>
            <option value="30">{t("30 дней", "30 күн")}</option>
            <option value="all">{t("Всё время", "Барлық уақыт")}</option>
          </select>
          <button
            className="button secondary"
            disabled={!all.length}
            onClick={() =>
              downloadFile(
                JSON.stringify(all, null, 2),
                "ordermind-journal.json",
                "application/json",
              )
            }
          >
            <Download size={16} />
            {t("Экспорт", "Экспорт")}
          </button>
        </div>
      </div>
      <div className="metrics-grid">
        <Metric
          label={t("Подтверждено заказов", "Расталған тапсырыс")}
          value={number(all.length)}
          caption={t("Из рабочего демо", "Жұмыс демосынан")}
          icon={CheckCheck}
        />
        <Metric
          label={t("Уточнений до кухни", "Асүйге дейінгі нақтылау")}
          value={number(checks)}
          caption={`${number(corrected)} ${t("заказов с проверкой", "тексерілген тапсырыс")}`}
          icon={ShieldCheck}
        />
        <Metric
          label={t("Модель сохранённых ₸", "Үнемделген ₸ моделі")}
          value={money(saved)}
          caption={t(
            "2 000 ₸ на исправленный заказ",
            "Түзетілген тапсырысқа 2 000 ₸",
          )}
          icon={Wallet}
        />
        <Metric
          label={t("Обработка / заказ", "Өңдеу / тапсырыс")}
          value="8 ₸"
          caption={t("Допущение для расчёта", "Есептеу болжамы")}
          icon={BarChart3}
        />
      </div>
      <div className="analytics-middle">
        <section className="panel orders-chart">
          <div className="panel-heading">
            <h2>
              {t("Заказы за последние 7 дней", "Соңғы 7 күндегі тапсырыс")}
            </h2>
            <div className="chart-legend">
              <span>
                <i />
                {t("С уточнением", "Нақтылаумен")}
              </span>
              <span>
                <i />
                {t("Без уточнения", "Нақтылаусыз")}
              </span>
            </div>
          </div>
          <div className="chart-grid">
            <div className="chart-y">
              <span>{max}</span>
              <span>{Math.floor(max / 2)}</span>
              <span>0</span>
            </div>
            <div className="chart-bars">
              {bars.map((b, i) => (
                <div className="bar-column" key={i}>
                  <div
                    className="bar-stack"
                    title={`${b.count} ${t("заказов", "тапсырыс")}`}
                  >
                    <span
                      className="bar-clean"
                      style={{
                        height: `${((b.count - b.corrected) / max) * 100}%`,
                      }}
                    />
                    <span
                      className="bar-corrected"
                      style={{ height: `${(b.corrected / max) * 100}%` }}
                    />
                  </div>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
          {!all.length && (
            <span className="chart-no-data">
              {t(
                "График заполнится после первого заказа",
                "Бірінші тапсырыстан кейін график толтырылады",
              )}
            </span>
          )}
        </section>
        <section className="analytics-note">
          <ShieldCheck size={29} />
          <h3>{t("Считаем честно", "Адал есептейміз")}</h3>
          <p>
            {t(
              "Предотвращённая переделка оценивается один раз на заказ, даже если в нём несколько вопросов.",
              "Бір тапсырыста бірнеше сұрақ болса да, алдын алынған қайта дайындау бір рет есептеледі.",
            )}
          </p>
          <small>
            {t(
              "Это модель, а не доказанная экономия. Для пилота нужен базовый замер ошибок до запуска.",
              "Бұл модель, дәлелденген үнем емес. Пилот үшін іске қосуға дейін қателерді өлшеу керек.",
            )}
          </small>
        </section>
      </div>
      <section className="panel journal-panel">
        <div className="panel-heading">
          <h2>
            {t("Журнал заказов", "Тапсырыстар журналы")}
            <span className="count-badge">{filtered.length}</span>
          </h2>
          <div className="segmented">
            <button
              onClick={() => setFilter("all")}
              className={filter === "all" ? "active" : ""}
            >
              {t("Все", "Барлығы")}
            </button>
            <button
              onClick={() => setFilter("corrected")}
              className={filter === "corrected" ? "active" : ""}
            >
              {t("С уточнением", "Нақтылаумен")}
            </button>
            <button
              onClick={() => setFilter("clean")}
              className={filter === "clean" ? "active" : ""}
            >
              {t("Без уточнения", "Нақтылаусыз")}
            </button>
          </div>
        </div>
        {!filtered.length ? (
          <div className="journal-empty">
            <BarChart3 size={27} />
            <h3>{t("Пока нет заказов", "Әзірге тапсырыс жоқ")}</h3>
            <p>
              {t(
                "Подтвердите заказ в демо, чтобы увидеть его здесь.",
                "Демода тапсырысты растаңыз, ол осында пайда болады.",
              )}
            </p>
            <Link href="/demo/" className="button primary">
              {t("Перейти к демо", "Демоға өту")}
              <ArrowUpRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{t("Время", "Уақыт")}</th>
                  <th>{t("Заказ", "Тапсырыс")}</th>
                  <th>{t("Статус", "Күй")}</th>
                  <th>{t("Сумма", "Сома")}</th>
                  <th>{t("Модель ₸", "₸ моделі")}</th>
                </tr>
              </thead>
              <tbody>
                {[...filtered].reverse().map((e) => (
                  <tr key={e.id}>
                    <td className="mono">
                      {new Date(e.timestamp).toLocaleString(
                        lang === "ru" ? "ru-RU" : "kk-KZ",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Almaty",
                        },
                      )}
                    </td>
                    <td>
                      <div className="journal-order">
                        <strong>
                          {e.items
                            .map(
                              (i) =>
                                `${i.qty}× ${menu.find((m) => m.id === i.menu_id)?.[lang === "ru" ? "name_ru" : "name_kk"] ?? i.menu_id}`,
                            )
                            .join(", ")}
                        </strong>
                        <details>
                          <summary>
                            {t("Фраза и правки", "Сөздер мен түзетулер")}
                          </summary>
                          <p>{e.raw_text}</p>
                          <p>
                            {t("Уточнений", "Нақтылаулар")}: {e.issues} ·{" "}
                            {t("Устранено", "Шешілді")}: {e.resolved}
                          </p>
                          <p>
                            {e.items
                              .map((i) =>
                                [
                                  i.size,
                                  Object.values(i.mods).join(", "),
                                  ...(i.notes ?? []).map(
                                    (n) =>
                                      n.text +
                                      (n.extra ? " +" + money(n.extra) : ""),
                                  ),
                                ]
                                  .filter(Boolean)
                                  .join(" · "),
                              )
                              .filter(Boolean)
                              .join("; ")}
                          </p>
                        </details>
                      </div>
                    </td>
                    <td>
                      <Badge green>
                        {e.issues
                          ? t("Уточнён", "Нақтыланды")
                          : t("Проверен", "Тексерілді")}
                      </Badge>
                    </td>
                    <td>{money(e.total)}</td>
                    <td className="green-text">
                      {e.modelSaved ? "+" + money(e.modelSaved) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="journal-footer">
          <span>
            {t(
              "Каждый заказ учитывается один раз · журнал этого браузера",
              "Әр тапсырыс бір рет есептеледі · осы браузердің журналы",
            )}
          </span>
          {events.length > 0 && (
            <button onClick={() => setReset(true)}>
              <Trash2 size={13} />
              {t("Очистить журнал", "Журналды тазалау")}
            </button>
          )}
        </div>
      </section>
      {reset && (
        <div className="modal-backdrop">
          <div
            className="panel reset-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
          >
            <h2 id="reset-title">
              {t("Очистить демо-журнал?", "Демо журналын тазалау керек пе?")}
            </h2>
            <p>
              {t(
                "Все заказы и счётчики в этом браузере будут удалены. Сначала можно экспортировать журнал.",
                "Бұл браузердегі барлық тапсырыс пен санауыш жойылады. Алдымен журналды экспорттауға болады.",
              )}
            </p>
            <div>
              <button
                className="button secondary"
                onClick={() => setReset(false)}
              >
                {t("Отмена", "Бас тарту")}
              </button>
              <button
                className="button danger"
                onClick={() => {
                  onClear();
                  setReset(false);
                }}
              >
                {t("Очистить", "Тазалау")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
