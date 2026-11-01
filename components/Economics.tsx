"use client";
import { useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Download,
  Info,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import {
  baseEconomics,
  calculateEconomics,
  presets,
  type EconomicsInput,
} from "@/lib/economics";
import { Badge, money, number, type T } from "./ui";
export function downloadFile(
  content: string,
  name: string,
  type = "text/csv;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function Economics({
  t,
  value,
  onChange,
}: {
  t: T;
  value: EconomicsInput;
  onChange: (v: EconomicsInput) => void;
}) {
  const [preset, setPreset] = useState("base");
  const [advanced, setAdvanced] = useState(false);
  const r = calculateEconomics(value);
  function update(
    key: keyof EconomicsInput,
    n: number,
    min: number,
    max: number,
  ) {
    setPreset("custom");
    onChange({
      ...value,
      [key]: Math.min(max, Math.max(min, Number.isFinite(n) ? n : min)),
    });
  }
  const mainFields: {
    key: keyof EconomicsInput;
    ru: string;
    kk: string;
    unit: string;
    min: number;
    max: number;
    step: number;
  }[] = [
    {
      key: "daily",
      ru: "Заказов в день",
      kk: "Күніне тапсырыс",
      unit: t("заказов", "тапсырыс"),
      min: 10,
      max: 1000,
      step: 10,
    },
    {
      key: "errorRate",
      ru: "Ошибок до внедрения",
      kk: "Енгізуге дейінгі қателер",
      unit: "%",
      min: 0,
      max: 30,
      step: 0.5,
    },
    {
      key: "errorCost",
      ru: "Потери на одну ошибку",
      kk: "Бір қате шығыны",
      unit: "₸",
      min: 0,
      max: 10000,
      step: 100,
    },
    {
      key: "reduction",
      ru: "Снижение ошибок",
      kk: "Қателерді азайту",
      unit: "%",
      min: 0,
      max: 100,
      step: 5,
    },
    {
      key: "apiCost",
      ru: "Обработка одного заказа",
      kk: "Бір тапсырысты өңдеу",
      unit: "₸",
      min: 0,
      max: 30,
      step: 0.5,
    },
  ];
  const extraFields: {
    key: keyof EconomicsInput;
    ru: string;
    kk: string;
    unit: string;
    min: number;
    max: number;
    step: number;
  }[] = [
    {
      key: "days",
      ru: "Дней в месяц",
      kk: "Айдағы күн",
      unit: "",
      min: 1,
      max: 31,
      step: 1,
    },
    {
      key: "subscription",
      ru: "Подписка",
      kk: "Жазылым",
      unit: "₸",
      min: 0,
      max: 500000,
      step: 1000,
    },
    {
      key: "included",
      ru: "Включено заказов",
      kk: "Қосылған тапсырыс",
      unit: "",
      min: 0,
      max: 50000,
      step: 100,
    },
    {
      key: "overage",
      ru: "Заказ сверх лимита",
      kk: "Лимиттен артық тапсырыс",
      unit: "₸",
      min: 0,
      max: 100,
      step: 1,
    },
    {
      key: "successFee",
      ru: "Плата за результат",
      kk: "Нәтижелік төлем",
      unit: "%",
      min: 0,
      max: 100,
      step: 1,
    },
    {
      key: "feeCap",
      ru: "Потолок платы за результат",
      kk: "Нәтижелік төлем шегі",
      unit: "₸",
      min: 0,
      max: 1000000,
      step: 1000,
    },
    {
      key: "support",
      ru: "Поддержка / месяц",
      kk: "Қолдау / ай",
      unit: "₸",
      min: 0,
      max: 200000,
      step: 1000,
    },
    {
      key: "cac",
      ru: "Стоимость привлечения",
      kk: "Клиент тарту құны",
      unit: "₸",
      min: 0,
      max: 2000000,
      step: 10000,
    },
    {
      key: "churn",
      ru: "Месячный отток",
      kk: "Айлық кету",
      unit: "%",
      min: 0,
      max: 100,
      step: 0.5,
    },
  ];
  return (
    <div className="page-body">
      <div className="page-heading">
        <div>
          <span className="overline">
            {t("ЮНИТ-ЭКОНОМИКА", "БІР ОРЫН ЭКОНОМИКАСЫ")}
          </span>
          <h1>{t("Выгода в понятных цифрах", "Нақты сандардағы пайда")}</h1>
          <p>
            {t(
              "Одна точка. Один месяц. Все допущения перед вами.",
              "Бір орын. Бір ай. Барлық болжам ашық.",
            )}
          </p>
        </div>
        <button
          className="button secondary"
          onClick={() =>
            downloadFile(
              "\uFEFF" +
                Object.entries({ ...value, ...r })
                  .map(([k, v]) => `${k};${v ?? ""}`)
                  .join("\n"),
              "ordermind-economics.csv",
            )
          }
        >
          <Download size={16} />
          {t("Скачать расчёт", "Есепті жүктеу")}
        </button>
      </div>
      <div className="economics-layout">
        <section className="panel calc-controls">
          <div className="panel-heading">
            <h2>{t("Параметры точки", "Орын параметрлері")}</h2>
            <button
              className="icon-button"
              onClick={() => {
                onChange(baseEconomics);
                setPreset("base");
              }}
              aria-label={t(
                "Сбросить параметры",
                "Параметрлерді қалпына келтіру",
              )}
            >
              <RotateCcw size={16} />
            </button>
          </div>
          <div className="segmented preset-tabs">
            {Object.entries(presets).map(([key, p]) => (
              <button
                className={preset === key ? "active" : ""}
                key={key}
                onClick={() => {
                  onChange(p);
                  setPreset(key);
                }}
              >
                {key === "base"
                  ? t("Базовый", "Негізгі")
                  : key === "cautious"
                    ? t("Осторожный", "Сақ")
                    : t("Оптимистичный", "Оң")}
              </button>
            ))}
          </div>
          {mainFields.map((f) => (
            <div className="range-field" key={f.key}>
              <label htmlFor={f.key}>{t(f.ru, f.kk)}</label>
              <div className="number-input">
                <input
                  id={f.key}
                  type="number"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={value[f.key]}
                  onChange={(e) =>
                    update(f.key, Number(e.target.value), f.min, f.max)
                  }
                />
                <span>{f.unit}</span>
              </div>
              <input
                aria-label={t(f.ru, f.kk)}
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={value[f.key]}
                onChange={(e) =>
                  update(f.key, Number(e.target.value), f.min, f.max)
                }
              />
            </div>
          ))}
          <button
            className="advanced-toggle"
            onClick={() => setAdvanced(!advanced)}
          >
            {t(
              "Тариф и дополнительные параметры",
              "Тариф және қосымша параметрлер",
            )}
            <ChevronDown
              size={15}
              style={{ transform: advanced ? "rotate(180deg)" : "" }}
            />
          </button>
          {advanced && (
            <div className="advanced-fields">
              {extraFields.map((f) => (
                <label key={f.key}>
                  {t(f.ru, f.kk)}
                  <div className="number-input">
                    <input
                      type="number"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={value[f.key]}
                      onChange={(e) =>
                        update(f.key, Number(e.target.value), f.min, f.max)
                      }
                    />
                    <span>{f.unit}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
          <div className="subtle-note">
            <Info size={14} />
            {t(
              "Это прогноз. В пилоте заменим допущения реальными замерами.",
              "Бұл болжам. Пилотта нақты өлшемдермен ауыстырамыз.",
            )}
          </div>
        </section>
        <div className="calc-results">
          <section className={`net-result ${r.net < 0 ? "negative" : ""}`}>
            <div>
              <Badge>
                {t("ЧИСТАЯ ВЫГОДА ЗАВЕДЕНИЯ", "ОРЫННЫҢ ТАЗА ПАЙДАСЫ")}
              </Badge>
              <ArrowUpRight size={27} />
            </div>
            <strong>{money(r.net)}</strong>
            <span>
              {t(
                "в месяц после оплаты сервиса",
                "қызмет ақысы төленген соң, айына",
              )}
            </span>
            <div className="roi-row">
              <TrendingUp size={17} />
              <b>{number(r.roi)}×</b>
              {t(
                "возврат на каждый заплаченный тенге",
                "әр төленген теңгеге қайтарым",
              )}
            </div>
          </section>
          <section className="panel breakdown">
            <div className="panel-heading">
              <h2>{t("Как складывается выгода", "Пайда қалай есептеледі")}</h2>
              <Badge>
                {number(r.orders)} {t("заказов / мес.", "тапсырыс / ай")}
              </Badge>
            </div>
            {[
              [
                t("Потери до внедрения", "Енгізуге дейінгі шығын"),
                money(r.loss),
                "",
              ],
              [
                t("Потенциально возвращено", "Ықтимал қайтарым"),
                money(r.recovered),
                "green-text",
              ],
              [t("Подписка", "Жазылым"), money(value.subscription), ""],
              [
                t("Заказы сверх лимита", "Лимиттен артық тапсырыс"),
                money(r.extra),
                "",
              ],
              [t("Плата за результат", "Нәтижелік төлем"), money(r.fee), ""],
            ].map(([l, v, c]) => (
              <div className="breakdown-row" key={l}>
                <span>{l}</span>
                <b className={c}>{v}</b>
              </div>
            ))}
            <div className="breakdown-row total">
              <span>{t("Заведение платит", "Орын төлейді")}</span>
              <strong>{money(r.payment)}</strong>
            </div>
            <p>
              {t(
                "Возвращено − подписка − сверхлимит − плата за результат = чистая выгода.",
                "Қайтарым − жазылым − артық тапсырыс − нәтижелік төлем = таза пайда.",
              )}
            </p>
          </section>
          <section className="panel provider-economics">
            <div className="panel-heading">
              <h2>{t("Экономика OrderMind", "OrderMind экономикасы")}</h2>
              <span>
                {t("до зарплат и маркетинга", "жалақы мен маркетингке дейін")}
              </span>
            </div>
            <div className="provider-grid">
              <div>
                <span>{t("Затраты на точку", "Орын шығындары")}</span>
                <strong>{money(r.cost)}</strong>
              </div>
              <div>
                <span>{t("Валовая прибыль", "Жалпы пайда")}</span>
                <strong className={r.profit < 0 ? "red-text" : "green-text"}>
                  {money(r.profit)}
                </strong>
              </div>
              <div>
                <span>{t("Валовая маржа", "Жалпы маржа")}</span>
                <strong>{number(r.margin)}%</strong>
              </div>
              <div>
                <span>{t("Окупаемость привлечения", "Тартудың өтелуі")}</span>
                <strong>
                  {r.payback !== null
                    ? number(r.payback) + " " + t("мес.", "ай")
                    : t("Не окупается", "Өтелмейді")}
                </strong>
              </div>
            </div>
            {r.profit < 0 && (
              <div className="alert error">
                {t(
                  "Стоимость обработки выше выручки. Текущий сценарий убыточен.",
                  "Өңдеу құны кірістен жоғары. Бұл сценарий шығынды.",
                )}
              </div>
            )}
            <small>
              {t(
                "Затраты = заказы × стоимость обработки + поддержка.",
                "Шығындар = тапсырыс × өңдеу құны + қолдау.",
              )}{" "}
              {r.ltv !== null &&
                `LTV / CAC: ${value.cac > 0 ? number(r.ltv / value.cac) : "—"}`}
            </small>
          </section>
        </div>
      </div>
      <section className="panel scenario-table">
        <div className="panel-heading">
          <h2>
            {t(
              "Три сценария из бизнес-модели",
              "Бизнес-модельдегі үш сценарий",
            )}
          </h2>
          <Badge>{t("Допущения", "Болжамдар")}</Badge>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{t("В месяц на точку", "Бір орынға айына")}</th>
                <th>{t("Осторожный", "Сақ")}</th>
                <th>{t("Базовый", "Негізгі")}</th>
                <th>{t("Оптимистичный", "Оң")}</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  l: t("Возвращено заведению", "Орынға қайтарым"),
                  k: "recovered",
                },
                { l: t("Плата за сервис", "Қызмет ақысы"), k: "payment" },
                { l: t("Чистая выгода", "Таза пайда"), k: "net" },
                {
                  l: t("Валовая прибыль OrderMind", "OrderMind жалпы пайдасы"),
                  k: "profit",
                },
              ].map((row) => (
                <tr key={row.k}>
                  <td>{row.l}</td>
                  {Object.values(presets).map((p, i) => (
                    <td className={row.k === "net" ? "green-text" : ""} key={i}>
                      {money(calculateEconomics(p)[row.k as "net"])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
