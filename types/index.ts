export interface Product {
  code: string;
  category: "restaurant" | "party" | "desk";
  price: number;
  image: string;
  title: Record<Lang, string>;
  meta: Record<Lang, string>;
  stats: Record<Lang, string>;
  tag: string;
  formats: string[];
  difficulty: "easy" | "medium";
}

export interface Bundle {
  price: number;
  image: string;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
}

export interface CartItem {
  title: Record<Lang, string>;
  price: number;
  code?: string;
  image?: string;
  meta?: Record<Lang, string>;
  description?: Record<Lang, string>;
}

export type Lang = "zh" | "en" | "ja" | "ko";

export type Category = "all" | "restaurant" | "party" | "desk";
export type PriceFilter = "all" | "free" | "paid";
export type SortOption = "featured" | "price-low" | "price-high" | "name";
export type PolicyKey = "refund" | "license" | "copyright" | "contact";

export interface PolicySection {
  title: Record<Lang, string>;
  body: Record<Lang, string>;
}
