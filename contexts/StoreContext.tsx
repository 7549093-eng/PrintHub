"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Lang, CartItem, Category, PriceFilter, SortOption, PolicyKey } from "@/types";

interface StoreState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  // Filters
  category: Category;
  setCategory: (c: Category) => void;
  priceFilter: PriceFilter;
  setPriceFilter: (f: PriceFilter) => void;
  formatFilter: string;
  setFormatFilter: (f: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (f: string) => void;
  sort: SortOption;
  setSort: (s: SortOption) => void;
  search: string;
  setSearch: (s: string) => void;
  // Policy
  activePolicy: PolicyKey;
  setActivePolicy: (k: PolicyKey) => void;
}

const StoreContext = createContext<StoreState | null>(null);

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "zh";
  try {
    const saved = localStorage.getItem("printhub-lang");
    if (["zh", "en", "ja", "ko"].includes(saved || "")) return saved as Lang;
  } catch { /* ignore */ }
  return "zh";
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [category, setCategory] = useState<Category>("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sort, setSort] = useState<SortOption>("featured");
  const [search, setSearch] = useState("");
  const [activePolicy, setActivePolicy] = useState<PolicyKey>("refund");

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("printhub-lang", l); } catch { /* ignore */ }
  }, []);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => [...prev, item]);
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <StoreContext.Provider
      value={{
        lang, setLang,
        cart, addToCart, removeFromCart, clearCart, cartTotal,
        cartOpen, setCartOpen,
        category, setCategory,
        priceFilter, setPriceFilter,
        formatFilter, setFormatFilter,
        difficultyFilter, setDifficultyFilter,
        sort, setSort,
        search, setSearch,
        activePolicy, setActivePolicy,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
