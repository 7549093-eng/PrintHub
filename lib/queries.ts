"use client";

import { supabase } from "@/lib/supabase";
import type { Product, Bundle, Lang } from "@/types";

// ─── Products ──────────────────────────────────────────────────
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }

  return (data || []).map(mapDbProduct);
}

export async function fetchProductByCode(code: string): Promise<Product | null> {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("code", code)
    .single();
  return data ? mapDbProduct(data) : null;
}

export async function saveProduct(product: Product & { id?: string }): Promise<boolean> {
  const db = mapToDbProduct(product);
  if (product.id) {
    const { error } = await supabase.from("products").update(db).eq("id", product.id);
    return !error;
  } else {
    const { error } = await supabase.from("products").insert(db);
    return !error;
  }
}

export async function deleteProduct(code: string): Promise<boolean> {
  const { error } = await supabase.from("products").delete().eq("code", code);
  return !error;
}

// ─── Bundles ───────────────────────────────────────────────────
export async function fetchBundles(): Promise<Bundle[]> {
  const { data } = await supabase
    .from("bundles")
    .select("*")
    .order("created_at", { ascending: true });

  return (data || []).map(mapDbBundle);
}

export async function saveBundle(bundle: Bundle & { id?: string }): Promise<boolean> {
  const db = mapToDbBundle(bundle);
  if (bundle.id) {
    const { error } = await supabase.from("bundles").update(db).eq("id", bundle.id);
    return !error;
  } else {
    const { error } = await supabase.from("bundles").insert(db);
    return !error;
  }
}

export async function deleteBundle(id: string): Promise<boolean> {
  const { error } = await supabase.from("bundles").delete().eq("id", id);
  return !error;
}

// ─── Orders ────────────────────────────────────────────────────
export async function createOrder(
  userId: string,
  total: number,
  items: { product_id?: string; bundle_id?: string; price: number }[]
): Promise<string | null> {
  const { data: order, error } = await supabase
    .from("orders")
    .insert({ user_id: userId, total, status: "pending" })
    .select("id")
    .single();

  if (error || !order) return null;

  const orderItems = items.map((item) => ({ ...item, order_id: order.id }));
  await supabase.from("order_items").insert(orderItems);

  return order.id;
}

export async function fetchUserOrders(userId: string) {
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data || [];
}

// ─── Downloads ─────────────────────────────────────────────────
export async function getSignedDownloadUrl(
  userId: string,
  productId: string,
  filePath: string
): Promise<string | null> {
  // Record the download
  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!order) return null;

  await supabase.from("user_downloads").insert({
    user_id: userId,
    order_id: order.id,
    product_id: productId,
    file_path: filePath,
    download_count: 1,
  });

  // Generate signed URL (valid for 1 hour)
  const { data } = await supabase.storage
    .from("stl-files")
    .createSignedUrl(filePath, 3600);

  return data?.signedUrl || null;
}

// ─── Leads ─────────────────────────────────────────────────────
export async function submitLead(email: string): Promise<boolean> {
  const { error } = await supabase.from("leads").insert({ email, source: "free_download" });
  return !error;
}

// ─── Service Requests ──────────────────────────────────────────
export async function submitServiceRequest(data: {
  name: string;
  email: string;
  request_type: string;
  budget?: string;
  project_details?: string;
}): Promise<boolean> {
  const { error } = await supabase.from("service_requests").insert(data);
  return !error;
}

// ─── Admin: Settings ───────────────────────────────────────────
export async function fetchAdminSettings(): Promise<Record<string, Record<string, string>>> {
  const { data } = await supabase.from("admin_settings").select("*");
  if (!data) return {};
  const result: Record<string, Record<string, string>> = {};
  for (const row of data) {
    if (!result[row.key]) result[row.key] = {};
    result[row.key][row.lang] = row.value;
  }
  return result;
}

export async function saveAdminSetting(key: string, lang: string, value: string): Promise<boolean> {
  const { error } = await supabase
    .from("admin_settings")
    .upsert({ key, lang, value }, { onConflict: "key,lang" });
  return !error;
}

// ─── Mappers (DB row ↔ Product/Bundle) ────────────────────────
function mapDbProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    code: row.code as string,
    category: row.category as Product["category"],
    price: Number(row.price),
    image: (row.image as string) || "",
    title: pickLang(row, "title"),
    meta: pickLang(row, "meta"),
    stats: pickLang(row, "stats"),
    tag: (row.tag as string) || "STL",
    formats: (row.formats as string[]) || ["stl", "3mf"],
    difficulty: (row.difficulty as Product["difficulty"]) || "easy",
  };
}

function mapDbBundle(row: Record<string, unknown>): Bundle {
  return {
    id: row.id as string,
    price: Number(row.price),
    image: (row.image as string) || "",
    title: pickLang(row, "title"),
    description: pickLang(row, "description"),
  };
}

function mapToDbProduct(p: Product): Record<string, unknown> {
  return {
    code: p.code,
    category: p.category,
    price: p.price,
    image: p.image,
    ...spreadLang(p.title, "title"),
    ...spreadLang(p.meta, "meta"),
    ...spreadLang(p.stats, "stats"),
    tag: p.tag,
    formats: p.formats,
    difficulty: p.difficulty,
    is_published: true,
  };
}

function mapToDbBundle(b: Bundle): Record<string, unknown> {
  return {
    price: b.price,
    image: b.image,
    ...spreadLang(b.title, "title"),
    ...spreadLang(b.description, "description"),
  };
}

function pickLang(row: Record<string, unknown>, prefix: string): Record<Lang, string> {
  return {
    zh: (row[`${prefix}_zh`] as string) || "",
    en: (row[`${prefix}_en`] as string) || "",
    ja: (row[`${prefix}_ja`] as string) || "",
    ko: (row[`${prefix}_ko`] as string) || "",
  };
}

function spreadLang(record: Record<Lang, string>, prefix: string) {
  return {
    [`${prefix}_zh`]: record.zh,
    [`${prefix}_en`]: record.en,
    [`${prefix}_ja`]: record.ja,
    [`${prefix}_ko`]: record.ko,
  };
}
