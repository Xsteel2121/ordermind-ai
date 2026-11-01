import { AudioLines, ArrowUpRight, Check } from "lucide-react";
import type { Language } from "@/lib/types";
export type T = (ru: string, kk: string) => string;
export const money = (n: number) =>
  new Intl.NumberFormat("ru-KZ", { maximumFractionDigits: 0 }).format(
    Math.round(n),
  ) + " ₸";
export const number = (n: number) =>
  new Intl.NumberFormat("ru-KZ", { maximumFractionDigits: 1 }).format(n);
export const label = (lang: Language, ru: string, kk: string) =>
  lang === "ru" ? ru : kk;
export function Logo() {
  return (
    <span className="brand-symbol">
      <AudioLines size={23} strokeWidth={2.2} />
    </span>
  );
}
export function Badge({
  children,
  green = false,
}: {
  children: React.ReactNode;
  green?: boolean;
}) {
  return (
    <span className={`badge ${green ? "green" : ""}`}>
      {green && <span className="status-dot" />}
      {children}
    </span>
  );
}
export function Metric({
  label,
  value,
  caption,
  icon: Icon,
}: {
  label: string;
  value: string;
  caption: string;
  icon?: typeof ArrowUpRight;
}) {
  return (
    <div className="metric">
      <div className="metric-label">
        {label}
        {Icon && <Icon size={17} />}
      </div>
      <strong>{value}</strong>
      <small>{caption}</small>
    </div>
  );
}
export function CheckLine({ children }: { children: React.ReactNode }) {
  return (
    <span className="check-line">
      <Check size={15} />
      {children}
    </span>
  );
}
