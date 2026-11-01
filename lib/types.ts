export type Language = "ru" | "kk";
export type View = "overview" | "demo" | "analytics" | "economics" | "menu";
export interface MenuItem {
  id: string;
  name_ru: string;
  name_kk: string;
  aliases: string[];
  price: number;
  sizes: string[];
  modifiers: Record<string, string[]>;
  category: string;
  serving: string;
  source_page: number;
}
export interface OrderNote {
  text: string;
  reviewed: boolean;
  extra: number;
}
export interface OrderItem {
  rowId: string;
  menu_id: string;
  qty: number;
  size: string | null;
  mods: Record<string, string>;
  notes?: OrderNote[];
  candidates?: string[];
  mention?: string;
}
export interface Issue {
  id: string;
  kind: "size" | "conflict" | "unknown" | "unsupported" | "choice" | "note";
  rowId?: string;
  message_ru: string;
  message_kk: string;
  fragment?: string;
  resolved?: boolean;
}
export interface ParsedOrder {
  raw_text: string;
  items: OrderItem[];
  issues: Issue[];
  engine?: "catalog" | "ai";
  notice?: string;
}
export interface OrderEvent {
  id: string;
  timestamp: string;
  raw_text: string;
  items: OrderItem[];
  total: number;
  issues: number;
  resolved: number;
  modelSaved: number;
  language: Language;
  processingMs: number;
}
