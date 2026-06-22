"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/contexts/StoreContext";
import { defaultProducts, defaultBundles, policyCopy, t, text, money, format } from "@/lib/data";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { submitLead, submitServiceRequest } from "@/lib/queries";
import type { Product, Bundle, Category, PolicyKey } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────
function useFilteredProducts(products: Product[]): Product[] {
  const { category, priceFilter, formatFilter, difficultyFilter, sort, search } = useStore();
  return useMemo(() => {
    const q = search.trim().toLowerCase();
    let visible = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (priceFilter === "free" && p.price !== 0) return false;
      if (priceFilter === "paid" && p.price === 0) return false;
      if (formatFilter !== "all" && !p.formats.includes(formatFilter)) return false;
      if (difficultyFilter !== "all" && p.difficulty !== difficultyFilter) return false;
      if (q) {
        const hay = [
          p.code, p.category,
          ...Object.values(p.title), ...Object.values(p.meta),
          p.formats.join(" "), p.difficulty,
        ].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === "price-low") visible.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") visible.sort((a, b) => b.price - a.price);
    else if (sort === "name") visible.sort((a, b) => text(a.title, "zh").localeCompare(text(b.title, "zh")));
    return visible;
  }, [category, priceFilter, formatFilter, difficultyFilter, sort, search]);
}

// ═══════════════════════════════════════════════════════════════════
// Sections
// ═══════════════════════════════════════════════════════════════════

function HeroSection() {
  const { lang } = useStore();
  return (
    <section className="hero" id="home">
      <div>
        <span className="eyebrow">{t("heroEyebrow", lang)}</span>
        <h1>{t("heroTitle", lang)}</h1>
        <p style={{ fontSize: "18px", color: "var(--color-text)", marginBottom: "12px" }}>
          {t("heroSubtitle", lang)}
        </p>
        <p>{t("heroCopy", lang)}</p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#free">{t("heroPrimary", lang)}</a>
          <a className="btn btn-secondary" href="#catalog">{t("heroSecondary", lang)}</a>
        </div>
      </div>
      <div className="hero-visual">
        <img
          src="/assets/printhub-c-animated-logo.svg"
          alt="PrintHub"
          style={{ width: "220px", height: "220px", opacity: 0.7 }}
        />
      </div>
    </section>
  );
}

function MetricsBar() {
  const { lang } = useStore();
  const metrics = [
    { key: "metricModels", value: "30" },
    { key: "metricFree", value: "10" },
    { key: "metricBundles", value: "3" },
    { key: "metricLicense", value: "$29.99+" },
  ];
  return (
    <div className="metrics-bar">
      {metrics.map((m) => (
        <div key={m.key} className="metric">
          <strong>{m.value}</strong>
          <span>{t(m.key, lang)}</span>
        </div>
      ))}
    </div>
  );
}

function FreeSection() {
  const { lang } = useStore();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitLead(email);
    setMsg(format(t("leadSuccess", lang), { email }));
    if (success) setEmail("");
  };

  return (
    <section data-section="free" id="free">
      <span className="eyebrow">{t("freeEyebrow", lang)}</span>
      <h2>{t("freeTitle", lang)}</h2>
      <div className="free-grid">
        <div>
          <h3 style={{ margin: "0 0 8px", fontSize: "20px" }}>{t("freeCardTitle", lang)}</h3>
          <p>{t("freeCardCopy", lang)}</p>
          <form className="form-grid compact" style={{ marginTop: "16px" }} onSubmit={handleSubmit}>
            <label>
              {t("emailLabel", lang)}
              <input id="lead-email" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="btn btn-primary btn-compact" type="submit">
                {t("sendDownload", lang)}
              </button>
            </div>
          </form>
          {msg && <p style={{ marginTop: "8px", color: "var(--color-accent)", fontSize: "13px" }}>{msg}</p>}
        </div>
        <div>
          <p style={{ fontWeight: 600, marginBottom: "8px" }}>{t("packTitle", lang)}</p>
          <ul className="pack-list">
            {["packItem1", "packItem2", "packItem3", "packItem4"].map((k) => (
              <li key={k}>{t(k, lang)}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const { lang, setCategory } = useStore();
  const cats: { key: Category; emoji: string; labelKey: string }[] = [
    { key: "restaurant", emoji: "🍽️", labelKey: "catRestaurant" },
    { key: "party", emoji: "🎉", labelKey: "catParty" },
    { key: "desk", emoji: "🖥️", labelKey: "catDesk" },
  ];
  return (
    <section data-section="categories" id="categories">
      <span className="eyebrow">{t("catEyebrow", lang)}</span>
      <h2>{t("catTitle", lang)}</h2>
      <div className="grid-3">
        {cats.map((cat) => (
          <a key={cat.key} className="cat-card" href="#catalog" onClick={() => setCategory(cat.key)}>
            <div className="cat-emoji">{cat.emoji}</div>
            <h3>{t(cat.labelKey, lang)}</h3>
          </a>
        ))}
      </div>
    </section>
  );
}

function CatalogSection({ products }: { products: Product[] }) {
  const {
    lang, category, setCategory, priceFilter, setPriceFilter,
    formatFilter, setFormatFilter, difficultyFilter, setDifficultyFilter,
    sort, setSort, addToCart, setCartOpen,
  } = useStore();
  const visible = useFilteredProducts(products);

  const catFilters: { key: Category; label: string }[] = [
    { key: "all", label: t("filterAll", lang) },
    { key: "restaurant", label: t("filterRestaurant", lang) },
    { key: "party", label: t("filterParty", lang) },
    { key: "desk", label: t("filterDesk", lang) },
  ];
  const priceFilters: { key: "all" | "free" | "paid"; label: string }[] = [
    { key: "all", label: t("filterAllPrices", lang) },
    { key: "free", label: t("filterFree", lang) },
    { key: "paid", label: t("filterPaid", lang) },
  ];

  const handleProductClick = (product: Product) => {
    if (product.price === 0) {
      const el = document.querySelector("#lead-email") as HTMLInputElement | null;
      el?.focus();
      el?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    addToCart({ title: product.title, price: product.price, code: product.code, image: product.image, meta: product.meta });
    setCartOpen(true);
  };

  return (
    <section data-section="catalog" id="catalog">
      <span className="eyebrow">{t("catalogEyebrow", lang)}</span>
      <h2>{t("catalogTitle", lang)}</h2>

      <div className="filter-bar">
        {catFilters.map((f) => (
          <button key={f.key} className={`filter-btn ${category === f.key ? "active" : ""}`} onClick={() => setCategory(f.key)}>
            {f.label}
          </button>
        ))}
        <span style={{ width: "12px" }} />
        {priceFilters.map((f) => (
          <button key={f.key} className={`filter-btn ${priceFilter === f.key ? "active" : ""}`} onClick={() => setPriceFilter(f.key)}>
            {f.label}
          </button>
        ))}
        <span style={{ width: "12px" }} />
        <select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)}>
          <option value="all">{t("filterAllFormats", lang)}</option>
          <option value="stl">STL</option>
          <option value="3mf">3MF</option>
          <option value="obj">OBJ</option>
        </select>
        <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
          <option value="all">{t("filterAllDifficulty", lang)}</option>
          <option value="easy">{t("difficultyEasy", lang)}</option>
          <option value="medium">{t("difficultyMedium", lang)}</option>
        </select>
        <label style={{ fontSize: "13px", color: "var(--color-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
          {t("sortLabel", lang)}
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="featured">{t("sortFeatured", lang)}</option>
            <option value="price-low">{t("sortLow", lang)}</option>
            <option value="price-high">{t("sortHigh", lang)}</option>
            <option value="name">{t("sortName", lang)}</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">{t("emptyState", lang)}</div>
      ) : (
        <div className="grid-3">
          {visible.map((p) => {
            const title = text(p.title, lang);
            return (
              <article key={p.code} className="product-card">
                <img src={p.image} alt={`${title} 3D printable preview`} />
                <div className="card-body">
                  <span className="badge">{text(p.tag, lang)}</span>
                  <div className="code">{p.code} · {p.formats.join(" / ").toUpperCase()}</div>
                  <h3>{title}</h3>
                  <p className="meta">{text(p.meta, lang)}</p>
                  <div className="price">{money(p.price, lang)}</div>
                  <button className="btn btn-primary btn-compact" onClick={() => handleProductClick(p)}>
                    {p.price === 0 ? t("download", lang) : t("add", lang)}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DetailsSection() {
  const { lang } = useStore();
  return (
    <section data-section="details" id="details">
      <h2 style={{ fontSize: "28px", marginBottom: "24px", marginTop: "0" }}>
        每个模型详情页标准
      </h2>
      <div className="detail-grid">
        <div className="detail-visual">3D 预览区域 (Three.js 待接入)</div>
        <div>
          <p><strong>安全下载</strong> — 用户付款后进入订单页下载，免费模型用邮箱领取。</p>
          <p><strong>文件格式</strong> — STL、3MF、OBJ</p>
          <p><strong>打印建议</strong> — 材料、层高、支撑、填充、耗时</p>
          <p><strong>授权信息</strong> — 个人/商业授权说明</p>
        </div>
      </div>
    </section>
  );
}

function MembershipsSection() {
  const { lang } = useStore();
  const plans = [
    { key: "planSingle", copy: "planSingleCopy", price: "$0.99–$2.99" },
    { key: "planMonthly", copy: "planMonthlyCopy", price: "$9.9/月" },
    { key: "planPoints", copy: "planPointsCopy", price: "100 点" },
  ];
  return (
    <section data-section="memberships" id="memberships">
      <span className="eyebrow">{t("membershipEyebrow", lang)}</span>
      <h2>{t("membershipTitle", lang)}</h2>
      <div className="grid-3">
        {plans.map((plan, i) => (
          <div key={plan.key} className={`plan-card ${i === 1 ? "featured" : ""}`}>
            <h3>{t(plan.key, lang)}</h3>
            <div className="plan-price">{plan.price}</div>
            <p>{t(plan.copy, lang)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AccountSection() {
  const { lang } = useStore();
  const stats = [
    { key: "accountPurchased", value: "24" },
    { key: "accountDownloads", value: "86" },
    { key: "accountFavorites", value: "17" },
    { key: "accountPoints", value: "320" },
    { key: "accountLicense", value: "5" },
    { key: "accountOrders", value: "12" },
  ];
  return (
    <section data-section="account" id="account">
      <span className="eyebrow">{t("accountEyebrow", lang)}</span>
      <h2>{t("accountTitle", lang)}</h2>
      <div className="account-stats">
        {stats.map((s) => (
          <div key={s.key} className="account-stat">
            <strong>{s.value}</strong>
            <span>{t(s.key, lang)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function BundlesSection({ bundles }: { bundles: Bundle[] }) {
  const { lang, addToCart, setCartOpen } = useStore();
  const handleAdd = (b: Bundle) => {
    addToCart({ title: b.title, price: b.price, image: b.image, description: b.description });
    setCartOpen(true);
  };
  return (
    <section data-section="bundles" id="bundles">
      <span className="eyebrow">{t("bundleEyebrow", lang)}</span>
      <h2>{t("bundleTitle", lang)}</h2>
      <div className="grid-3">
        {bundles.map((b, i) => (
          <article key={i} className="bundle-card">
            <img src={b.image} alt={text(b.title, lang)} />
            <div className="bundle-body">
              <p className="eyebrow">{t("bundleLabel", lang)}</p>
              <h3>{text(b.title, lang)}</h3>
              <p>{text(b.description, lang)}</p>
              <span className="bundle-price">${b.price.toFixed(2)}</span>
              <button className="btn btn-primary btn-compact" onClick={() => handleAdd(b)}>
                {t("addBundle", lang)}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function LicenseSection() {
  const { lang } = useStore();
  const licenses = [
    { key: "personalTitle", items: ["personal1", "personal2", "personal3"], price: "$1.99–$4.99" },
    { key: "commercialTitle", items: ["commercial1", "commercial2", "commercial3"], price: "$29.99–$99.99" },
    { key: "customTitle", items: ["custom1", "custom2", "custom3"], price: "$29–$199" },
  ];
  return (
    <section data-section="license" id="license">
      <span className="eyebrow">{t("licenseEyebrow", lang)}</span>
      <h2>{t("licenseTitle", lang)}</h2>
      <div className="grid-3">
        {licenses.map((lic, i) => (
          <div key={lic.key} className={`license-card ${i === 1 ? "featured" : ""}`}>
            <h3>{t(lic.key, lang)}</h3>
            <ul>
              {lic.items.map((item) => <li key={item}>{t(item, lang)}</li>)}
            </ul>
            <strong style={{ color: "var(--color-accent)", fontSize: "18px" }}>{lic.price}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function OperationsSection() {
  const { lang } = useStore();
  const ops = [
    { key: "opsModels", copy: "opsModelsCopy" },
    { key: "opsBatch", copy: "opsBatchCopy" },
    { key: "opsOrders", copy: "opsOrdersCopy" },
    { key: "opsData", copy: "opsDataCopy" },
    { key: "opsQuality", copy: "opsQualityCopy" },
    { key: "opsAi", copy: "opsAiCopy" },
  ];
  return (
    <section data-section="operations" id="operations">
      <span className="eyebrow">{t("opsEyebrow", lang)}</span>
      <h2>{t("opsTitle", lang)}</h2>
      <div className="ops-grid">
        {ops.map((op) => (
          <div key={op.key} className="ops-card">
            <h3>{t(op.key, lang)}</h3>
            <p>{t(op.copy, lang)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServicesSection() {
  const { lang } = useStore();
  const [msg, setMsg] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reqType, setReqType] = useState("custom");
  const [budget, setBudget] = useState("unsure");
  const [details, setDetails] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitServiceRequest({
      name, email,
      request_type: reqType,
      budget: budget === "unsure" ? undefined : budget,
      project_details: details,
    });
    setMsg(t("serviceSuccess", lang));
  };

  return (
    <section data-section="services" id="services">
      <span className="eyebrow">{t("serviceEyebrow", lang)}</span>
      <h2>{t("serviceTitle", lang)}</h2>
      <form className="form-grid" style={{ maxWidth: "640px" }} onSubmit={handleSubmit}>
        <label>
          {t("nameLabel", lang)}
          <input type="text" required placeholder={t("namePlaceholder", lang)} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          {t("emailLabel", lang)}
          <input type="email" required placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          {t("requestType", lang)}
          <select value={reqType} onChange={(e) => setReqType(e.target.value)}>
            <option value="custom">{t("requestCustom", lang)}</option>
            <option value="modify">{t("requestModify", lang)}</option>
            <option value="print">{t("requestPrint", lang)}</option>
            <option value="license">{t("requestLicense", lang)}</option>
          </select>
        </label>
        <label>
          {t("budgetLabel", lang)}
          <select value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="unsure">{t("budgetUnsure", lang)}</option>
            <option value="10-50">$10–$50</option>
            <option value="50-200">$50–$200</option>
            <option value="200+">$200+</option>
          </select>
        </label>
        <label style={{ gridColumn: "1 / -1" }}>
          {t("projectDetails", lang)}
          <textarea placeholder={t("projectPlaceholder", lang)} value={details} onChange={(e) => setDetails(e.target.value)} />
        </label>
        <div style={{ gridColumn: "1 / -1" }}>
          <button className="btn btn-primary" type="submit">{t("quoteButton", lang)}</button>
        </div>
        {msg && (
          <p style={{ gridColumn: "1 / -1", color: "var(--color-accent)", fontSize: "13px" }}>{msg}</p>
        )}
      </form>
    </section>
  );
}

function PoliciesSection() {
  const { lang, activePolicy, setActivePolicy } = useStore();
  const tabs: PolicyKey[] = ["refund", "license", "copyright", "contact"];
  const current = policyCopy[activePolicy];
  return (
    <section data-section="policies" id="policies">
      <span className="eyebrow">{t("policyEyebrow", lang)}</span>
      <h2>{t("policyTitle", lang)}</h2>
      <div className="policy-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activePolicy === tab ? "active" : ""}
            onClick={() => setActivePolicy(tab)}
          >
            {t(`policy${tab.charAt(0).toUpperCase() + tab.slice(1)}`, lang)}
          </button>
        ))}
      </div>
      <div style={{ maxWidth: "680px" }}>
        <h3>{text(current.title, lang)}</h3>
        <p>{text(current.body, lang)}</p>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════
export default function HomePage() {
  const { products, bundles, loading, error } = useSupabaseData();

  return (
    <main>
      {loading && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          padding: "4px 16px", background: "var(--color-accent)", color: "var(--color-ink)",
          fontSize: "13px", textAlign: "center", fontWeight: 600,
        }}>
          正在加载模型数据...
        </div>
      )}
      {error && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          padding: "4px 16px", background: "#f43f5e", color: "#fff",
          fontSize: "13px", textAlign: "center",
        }}>
          {error}
        </div>
      )}
      <HeroSection />
      <MetricsBar />
      <FreeSection />
      <CategoriesSection />
      <CatalogSection products={products} />
      <DetailsSection />
      <MembershipsSection />
      <AccountSection />
      <BundlesSection bundles={bundles} />
      <LicenseSection />
      <OperationsSection />
      <ServicesSection />
      <PoliciesSection />
    </main>
  );
}
