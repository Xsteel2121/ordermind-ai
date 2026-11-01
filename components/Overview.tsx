"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Check,
  CheckCheck,
  Coffee,
  Headphones,
  Languages,
  ReceiptText,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import { Badge, type T } from "./ui";
export default function Overview({ t }: { t: T }) {
  return (
    <div className="overview">
      <section className="landing-hero">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="overline">
            <span className="status-dot" />
            {t("СОЗДАНО ДЛЯ КАЗАХСТАНА", "ҚАЗАҚСТАН ҮШІН ЖАСАЛҒАН")}
          </span>
          <h1>
            {t("Понимать гостя.", "Қонақты түсіну.")}
            <br />
            <em>{t("С первого слова.", "Бірінші сөзден.")}</em>
          </h1>
          <p>
            {t(
              "OrderMind превращает русский, қазақша и их смесь в точный заказ по меню. Меньше уточнений у кухни. Больше внимания гостю.",
              "OrderMind орысша, қазақша және аралас сөйлеуді мәзірге сай тапсырысқа айналдырады. Асүйде сұрақ аз. Қонаққа көңіл көп.",
            )}
          </p>
          <div className="hero-actions">
            <Link href="/demo/" className="button primary">
              {t("Попробовать в деле", "Іс жүзінде көру")}
              <ArrowUpRight size={18} />
            </Link>
            <Link href="/economics/" className="button quiet">
              {t("Посчитать выгоду", "Пайданы есептеу")}
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-proof">
            <div className="proof-languages">
              <span>RU</span>
              <span>KK</span>
            </div>
            <span>
              {t(
                "Два языка. Один понятный заказ.",
                "Екі тіл. Бір түсінікті тапсырыс.",
              )}
              <small>
                {t(
                  "Без подключения кассы · прямо в браузере",
                  "Кассасыз · тікелей браузерде",
                )}
              </small>
            </span>
          </div>
        </motion.div>
        <motion.div
          className="hero-stage"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.12 }}
        >
          <div className="stage-grid" />
          <div className="stage-label">
            <span className="status-dot" />
            {t("ОТ РЕЧИ К ДЕЙСТВИЮ", "СӨЗДЕН ІСКЕ")}
            <span>01 — 03</span>
          </div>
          <div className="floating-language lang-ru">По-русски</div>
          <div className="floating-language lang-kk">Қазақша</div>
          <div className="hero-orb">
            <AudioLines size={50} strokeWidth={1.5} />
          </div>
          <div className="demo-speech">
            <span>
              <MicSymbol />
              {t("Гость говорит", "Қонақ сөйлейді")}
              <b>RU + KK</b>
            </span>
            <p>
              «Бір капучино 300 мл,
              <br />
              және круассан с сёмгой»
            </p>
            <div className="small-wave" aria-hidden="true">
              {Array.from({ length: 35 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    height: 5 + ((i * 11) % 23),
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="hero-connection">
            <ArrowDown size={17} />
            <span>
              {t(
                "Проверено по меню Coffee Boom",
                "Coffee Boom мәзірімен тексерілді",
              )}
            </span>
          </div>
          <div className="hero-ticket">
            <div>
              <ReceiptText size={17} />
              <b>{t("Заказ собран", "Тапсырыс жиналды")}</b>
              <Badge green>{t("Проверен", "Тексерілді")}</Badge>
            </div>
            <p>
              <Coffee size={18} />
              <span>
                Капучино Single<small>300 мл · 1 {t("шт.", "дана")}</small>
              </span>
              <strong>1 400 ₸</strong>
            </p>
            <p>
              <UtensilsCrossed size={18} />
              <span>
                Круассан с сёмгой<small>190 г · 1 {t("шт.", "дана")}</small>
              </span>
              <strong>3 200 ₸</strong>
            </p>
            <div className="hero-ticket-total">
              <span>{t("Итого", "Барлығы")}</span>
              <strong>4 600 ₸</strong>
              <CheckCheck size={20} />
            </div>
          </div>
          <div className="stage-sticker">
            <ShieldCheck size={20} />
            <span>
              {t("249 реальных позиций", "249 нақты өнім")}
              <small>
                {t("Только из вашего меню", "Тек сіздің мәзіріңізден")}
              </small>
            </span>
          </div>
        </motion.div>
      </section>
      <div className="landing-strip">
        <span>
          {t(
            "Создан для живого потока заказов",
            "Тапсырыстар ағыны үшін жасалған",
          )}
        </span>
        <b>DRIVE-THRU</b>
        <i />
        <b>COFFEE SHOPS</b>
        <i />
        <b>FAST FOOD</b>
        <span className="strip-end">RU / KK / MIX</span>
      </div>
      <section className="landing-section">
        <div className="section-heading">
          <div>
            <span className="overline">
              {t("ПОНЯТНЫЙ ПРОЦЕСС", "ТҮСІНІКТІ ҮДЕРІС")}
            </span>
            <h2>
              {t("Сложная речь.", "Күрделі сөйлеу.")}
              <br />
              <span>{t("Простая работа.", "Жеңіл жұмыс.")}</span>
            </h2>
          </div>
          <p>
            {t(
              "Гость говорит как привык. OrderMind помогает сотруднику проверить каждую деталь до подтверждения.",
              "Қонақ үйренген тілінде сөйлейді. OrderMind растауға дейін әр мәліметті тексеруге көмектеседі.",
            )}
          </p>
        </div>
        <div className="feature-grid">
          {[
            {
              icon: Languages,
              n: "01",
              title: t("Слышать обе стороны", "Екі тілді түсіну"),
              text: t(
                "Русский, қазақша и привычная смесь — в одном поле ввода.",
                "Орысша, қазақша және аралас сөйлеу — бір енгізу өрісінде.",
              ),
            },
            {
              icon: ReceiptText,
              n: "02",
              title: t("Собрать по меню", "Мәзірмен жинау"),
              text: t(
                "249 блюд Coffee Boom. Реальные цены, порции и варианты.",
                "Coffee Boom-ның 249 тағамы. Нақты бағалар, порциялар мен нұсқалар.",
              ),
            },
            {
              icon: ShieldCheck,
              n: "03",
              title: t("Уточнить до кухни", "Асүйге дейін нақтылау"),
              text: t(
                "Размер не указан? Добавка под вопросом? Сотрудник видит, что проверить.",
                "Өлшемі жоқ па? Қоспа белгісіз бе? Қызметкер нені тексеру керегін көреді.",
              ),
            },
          ].map((f, i) => (
            <motion.article
              key={f.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <div>
                <span className="feature-icon">
                  <f.icon size={25} />
                </span>
                <span className="mono">/{f.n}</span>
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </motion.article>
          ))}
        </div>
      </section>
      <section className="economy-banner">
        <div>
          <span className="overline">
            {t("ТОЧНОСТЬ, КОТОРУЮ МОЖНО ПОСЧИТАТЬ", "ЕСЕПТЕУГЕ БОЛАТЫН ДӘЛДІК")}
          </span>
          <h2>
            {t("Меньше переделок.", "Қайта дайындау аз.")}
            <br />
            {t("Больше в кассе.", "Кассада көбірек.")}
          </h2>
          <p>
            {t(
              "Оцените потенциальную выгоду вашей точки. Все допущения открыты и меняются в калькуляторе.",
              "Орынның ықтимал пайдасын бағалаңыз. Барлық болжам ашық әрі калькуляторда өзгертіледі.",
            )}
          </p>
          <Link href="/economics/" className="button dark">
            {t("Рассчитать свою выгоду", "Өз пайдаңызды есептеу")}
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="economy-number">
          <span>
            {t(
              "Чистая выгода в базовом сценарии",
              "Негізгі сценарийдегі таза пайда",
            )}
          </span>
          <strong>
            269 000 <small>₸</small>
          </strong>
          <p>
            {t(
              "в месяц · после оплаты сервиса",
              "айына · қызмет ақысынан кейін",
            )}
          </p>
          <div>
            <span>200 {t("заказов / день", "тапсырыс / күн")}</span>
            <span>−60% {t("ошибок", "қате")}</span>
          </div>
          <small>
            {t(
              "Расчётная модель, результат пилота ещё не измерен.",
              "Есептік модель, пилот нәтижесі әлі өлшенген жоқ.",
            )}
          </small>
        </div>
      </section>
      <section className="landing-cta">
        <Headphones size={32} />
        <div>
          <h2>{t("Проверьте на своей фразе.", "Өз сөзіңізбен тексеріңіз.")}</h2>
          <p>
            {t(
              "Откройте демо. Закажите кофе. Увидите весь путь до готового заказа.",
              "Демоны ашыңыз. Кофеге тапсырыс беріңіз. Барлық жолын көріңіз.",
            )}
          </p>
        </div>
        <Link href="/demo/" className="button primary">
          {t("Открыть демо", "Демоны ашу")}
          <ArrowRight size={18} />
        </Link>
      </section>
      <footer>
        <span>© 2026 OrderMind AI</span>
        <span>
          {t(
            "«Мен кәсіпкермін» · Астана, Казахстан",
            "«Мен кәсіпкермін» · Астана, Қазақстан",
          )}
        </span>
        <span>Made for real conversations.</span>
      </footer>
    </div>
  );
}
function MicSymbol() {
  return <AudioLines size={15} />;
}
