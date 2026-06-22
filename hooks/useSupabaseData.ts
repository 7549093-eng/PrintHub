"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchProducts, fetchBundles } from "@/lib/queries";
import { defaultProducts, defaultBundles } from "@/lib/data";
import type { Product, Bundle } from "@/types";

interface SupabaseDataState {
  products: Product[];
  bundles: Bundle[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Cache to avoid re-fetching on every render
let cachedProducts: Product[] | null = null;
let cachedBundles: Bundle[] | null = null;

export function useSupabaseData(): SupabaseDataState {
  const [products, setProducts] = useState<Product[]>(cachedProducts || defaultProducts);
  const [bundles, setBundles] = useState<Bundle[]>(cachedBundles || defaultBundles);
  const [loading, setLoading] = useState(!cachedProducts);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, buns] = await Promise.all([fetchProducts(), fetchBundles()]);
      if (prods.length > 0) {
        cachedProducts = prods;
        setProducts(prods);
      } else if (!cachedProducts) {
        setProducts(defaultProducts);
      }
      if (buns.length > 0) {
        cachedBundles = buns;
        setBundles(buns);
      } else if (!cachedBundles) {
        setBundles(defaultBundles);
      }
      if (prods.length === 0 && buns.length === 0) {
        // No Supabase data yet — that's fine, using defaults
        setError(null);
      }
    } catch (err) {
      setError("无法连接数据库，使用本地数据。");
      if (!cachedProducts) setProducts(defaultProducts);
      if (!cachedBundles) setBundles(defaultBundles);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cachedProducts) load();
  }, [load]);

  return { products, bundles, loading, error, refresh: load };
}
