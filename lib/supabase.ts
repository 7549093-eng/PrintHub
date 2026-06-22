import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;
let _warned = false;

function getSupabase(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    _client = createClient(url, key);
    return _client;
  }

  // During build or when not configured, return a safe stub
  if (!_warned && typeof window !== "undefined") {
    console.warn("Supabase: NEXT_PUBLIC_SUPABASE_URL / ANON_KEY not set. API calls will fail.");
    _warned = true;
  }

  // Return a stub that always returns { data: null, error: Error }
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }), order: () => Promise.resolve({ data: [], error: null, count: 0 }) }), order: () => Promise.resolve({ data: [], error: null, count: 0 }) }),
      insert: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }) }),
      upsert: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
    }),
    storage: {
      from: () => ({
        createSignedUrl: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      }),
    },
  } as unknown as SupabaseClient;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabase();
    return (client as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// ─── Database types ────────────────────────────────────────────
export interface DbProduct {
  id?: string;
  code: string;
  category: "restaurant" | "party" | "desk";
  price: number;
  image: string;
  title_zh: string; title_en: string; title_ja: string; title_ko: string;
  meta_zh: string;  meta_en: string;  meta_ja: string;  meta_ko: string;
  stats_zh: string; stats_en: string; stats_ja: string; stats_ko: string;
  tag: string;
  formats: string[];
  difficulty: "easy" | "medium";
  is_published: boolean;
  created_at?: string;
}

export interface DbBundle {
  id?: string;
  price: number;
  image: string;
  title_zh: string; title_en: string; title_ja: string; title_ko: string;
  description_zh: string; description_en: string; description_ja: string; description_ko: string;
  created_at?: string;
}

export interface DbOrder {
  id?: string;
  user_id: string;
  total: number;
  status: "pending" | "paid" | "cancelled";
  payment_ref?: string;
  created_at?: string;
}

export interface DbOrderItem {
  id?: string;
  order_id: string;
  product_id?: string;
  bundle_id?: string;
  price: number;
}

export interface DbUserDownload {
  id?: string;
  user_id: string;
  order_id: string;
  file_path: string;
  download_count: number;
  expires_at?: string;
  created_at?: string;
}

export interface DbLead {
  id?: string;
  email: string;
  source: string;
  created_at?: string;
}

export interface DbServiceRequest {
  id?: string;
  name: string;
  email: string;
  request_type: string;
  budget?: string;
  project_details?: string;
  created_at?: string;
}

export interface DbAdminSetting {
  id?: string;
  key: string;
  lang: string;
  value: string;
}
