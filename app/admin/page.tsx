"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { defaultProducts, defaultBundles, ui } from "@/lib/data";
import type { Lang } from "@/types";

const STORAGE_KEY = "printhub-content-v1";
const LANGS: Lang[] = ["zh", "en", "ja", "ko"];
const LANG_LABELS: Record<Lang, string> = { zh: "中文", en: "English", ja: "日本語", ko: "한국어" };

const COPY_FIELDS: { key: string; label: string }[] = [
  { key: "brandSub", label: "品牌副标题" },
  { key: "heroTitle", label: "首页大标题" },
  { key: "heroCopy", label: "首页说明" },
  { key: "heroPrimary", label: "主按钮" },
  { key: "heroSecondary", label: "副按钮" },
  { key: "freeTitle", label: "免费模型区标题" },
  { key: "catalogTitle", label: "模型库标题" },
  { key: "bundleTitle", label: "套装区标题" },
  { key: "licenseTitle", label: "授权区标题" },
  { key: "serviceTitle", label: "定制服务标题" },
];

interface Content {
  brandName: string;
  ui: Record<string, Record<string, string>>;
  products: Record<string, unknown>[];
  bundles: Record<string, unknown>[];
}

function loadContent(): Content {
  try {
    if (typeof window === "undefined") return getDefaults();
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return getDefaults();
    const parsed = JSON.parse(saved);
    return {
      brandName: parsed.brandName || "PrintHub",
      ui: parsed.ui || {},
      products: Array.isArray(parsed.products) ? parsed.products : [],
      bundles: Array.isArray(parsed.bundles) ? parsed.bundles : [],
    };
  } catch {
    return getDefaults();
  }
}

function getDefaults(): Content {
  return {
    brandName: "PrintHub",
    ui: {
      zh: { brandSub: "实用模型下载", heroTitle: "为商店、派对和桌面场景准备的可打印模型。", heroCopy: "用免费模型引流，用低价单品和套装转化，再通过商业授权服务打印农场和小卖家。", heroPrimary: "领�ȡ免费模型", heroSecondary: "浏览模型库", freeTitle: "先送出真正有用的文件，再推荐完整套装。", catalogTitle: "来自首批 30 个模型计划的上架产品。", bundleTitle: "套装把免费流量变成更明确的购买意图。", licenseTitle: "给玩家、打印农场和小卖家的清晰授权。", serviceTitle: "定制 STL 和代打印询盘流程。" },
      en: { brandSub: "Practical model downloads", heroTitle: "Print-ready models for shops, parties, and desk setups.", heroCopy: "Use free models for traffic, low-cost products and bundles for conversion, and commercial licenses for print farms.", heroPrimary: "Get free models", heroSecondary: "Browse catalog", freeTitle: "Give away useful files, then recommend the full pack.", catalogTitle: "Launch products from the first 30-model plan.", bundleTitle: "Bundles turn free traffic into paid checkout intent.", licenseTitle: "Clear licensing for hobby users, print farms, and small sellers.", serviceTitle: "Custom STL and print-this-for-me inquiry flow." },
      ja: { brandSub: "実用モデルダウンロード", heroTitle: "店舗、パーティー、デスク向けのプリント対応モデル。", heroCopy: "無料モデルで集客し、低価格モデルとセットで転換、商用ライセンスで印刷販売者にも対応します。", heroPrimary: "無料モデルを入手", heroSecondary: "モデルを見る", freeTitle: "役立つファイルを配布し、フルセットへつなげます。", catalogTitle: "最初の30モデル計画からの商品。", bundleTitle: "セット商品で無料流入を購入意欲に変えます。", licenseTitle: "ユーザー、印刷販売者、小規模ショップ向けの明確なライセンス。", serviceTitle: "カスタムSTLとプリント代行の問い合わせ。" },
      ko: { brandSub: "실용 모델 다운로드", heroTitle: "매장, 파티, 데스크용 바로 출력 가능한 모델.", heroCopy: "무료 모델로 유입을 만들고, 저가 상품과 번들로 전환하며, 상업용 라이선스로 출력 판매자까지 대응합니다.", heroPrimary: "무료 모델 받기", heroSecondary: "모델 보기", freeTitle: "실제로 유용한 파일을 제공하고 전체 팩을 추천합니다.", catalogTitle: "첫 30개 모델 계획의 출시 상품.", bundleTitle: "번들은 무료 유입을 구매 의도로 전환합니다.", licenseTitle: "취미 사용자, 출력 판매자, 소규모 판매자를 위한 명확한 라이선스.", serviceTitle: "맞춤 STL 및 출력 대행 문의 흐름." },
    },
    products: [],
    bundles: [],
  };
}

function showToast(msg: string) {
  const el = document.getElementById("admin-toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2600);
}

// ═══════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const [content, setContent] = useState<Content>(() => loadContent());
  const [activeLang, setActiveLang] = useState<Lang>("zh");
  const importRef = useRef<HTMLInputElement>(null);

  const save = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    showToast("已保存。刷新网站首页即可看到修改。");
  }, [content]);

  // ═══ Basic Content ═══
  function updateBrand(name: string) {
    setContent((c) => ({ ...c, brandName: name }));
  }
  function updateUIField(key: string, value: string) {
    setContent((c) => {
      const ui = { ...c.ui };
      ui[activeLang] = { ...(ui[activeLang] || {}), [key]: value };
      return { ...c, ui };
    });
  }

  // ═══ Products ═══
  function addProduct() {
    setContent((c) => ({
      ...c,
      products: [
        {
          code: "NEW", category: "desk", price: 0, image: "/assets/thumb-desk.png",
          title: { zh: "新商品", en: "New Product", ja: "新商品", ko: "새 상품" },
          meta: { zh: "", en: "", ja: "", ko: "" },
          stats: { zh: "", en: "", ja: "", ko: "" },
          tag: "freePrice", formats: ["stl", "3mf"], difficulty: "easy",
        },
        ...c.products,
      ],
    }));
  }
  function removeProduct(i: number) {
    setContent((c) => ({ ...c, products: c.products.filter((_, idx) => idx !== i) }));
  }
  function updateProductField(i: number, field: string, value: unknown) {
    setContent((c) => {
      const products = [...c.products];
      products[i] = { ...products[i], [field]: value };
      if (field === "price") products[i].tag = (Number(value) || 0) === 0 ? "freePrice" : "STL";
      return { ...c, products };
    });
  }
  function updateProductLang(i: number, multiKey: string, lang: Lang, value: string) {
    setContent((c) => {
      const products = [...c.products];
      products[i] = { ...products[i], [multiKey]: { ...(products[i][multiKey] as Record<string, string> || {}), [lang]: value } };
      return { ...c, products };
    });
  }

  // ═══ Bundles ═══
  function addBundle() {
    setContent((c) => ({
      ...c,
      bundles: [
        { price: 9.99, image: "/assets/thumb-bundle.png", title: { zh: "新套装", en: "New Bundle", ja: "新セット", ko: "새 번들" }, description: { zh: "", en: "", ja: "", ko: "" } },
        ...c.bundles,
      ],
    }));
  }
  function removeBundle(i: number) {
    setContent((c) => ({ ...c, bundles: c.bundles.filter((_, idx) => idx !== i) }));
  }
  function updateBundleField(i: number, field: string, value: unknown) {
    setContent((c) => {
      const bundles = [...c.bundles];
      bundles[i] = { ...bundles[i], [field]: value };
      return { ...c, bundles };
    });
  }
  function updateBundleLang(i: number, multiKey: string, lang: Lang, value: string) {
    setContent((c) => {
      const bundles = [...c.bundles];
      bundles[i] = { ...bundles[i], [multiKey]: { ...(bundles[i][multiKey] as Record<string, string> || {}), [lang]: value } };
      return { ...c, bundles };
    });
  }

  // ═══ Backup ═══
  function exportBackup() {
    const json = JSON.stringify(content, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "printhub-content-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("备份已导出。");
  }

  function importBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        setContent({
          brandName: data.brandName || "PrintHub",
          ui: data.ui || {},
          products: Array.isArray(data.products) ? data.products : [],
          bundles: Array.isArray(data.bundles) ? data.bundles : [],
        });
        showToast("备份已导入。请点击保存。");
      } catch {
        showToast("导入失败，请检查 JSON 文件。");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function resetDefaults() {
    if (!confirm("确定清空后台修改并恢复默认内容吗？")) return;
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    setContent(getDefaults());
    showToast("已恢复默认内容。");
  }

  // ═══ Render ═══
  const brandVal = content.brandName || "PrintHub";
  const currentUI = content.ui[activeLang] || {};

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-side">
        <Link href="/">
          <img src="/assets/logo.png" alt="" />
          <strong>后台</strong>
        </Link>
        <nav>
          <a href="#basic">基础内容</a>
          <a href="#products">商品</a>
          <a href="#bundles">套装</a>
          <a href="#backup">备份</a>
        </nav>
        <p>保存后刷新网站首页即可看到修改。</p>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <header className="admin-top">
          <div>
            <p className="eyebrow">Content Manager</p>
            <h1>网站内容后台</h1>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Link className="btn btn-secondary btn-compact" href="/">打开网站</Link>
            <button className="btn btn-primary btn-compact" onClick={save}>保存修改</button>
          </div>
        </header>

        {/* Basic Content */}
        <section className="panel" id="basic">
          <div className="panel-head">
            <h2>基础内容</h2>
            <p>修改品牌名、首页文案和主要模块标题。</p>
          </div>
          <div className="form-grid compact" style={{ marginBottom: "16px" }}>
            <label>
              品牌名
              <input type="text" value={brandVal} onChange={(e) => updateBrand(e.target.value)} />
            </label>
          </div>
          <div className="lang-tabs">
            {LANGS.map((l) => (
              <button key={l} className={l === activeLang ? "active" : ""} onClick={() => setActiveLang(l)}>
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
          <div className="copy-editor">
            {COPY_FIELDS.map(({ key, label }) => {
              const Tag = key.includes("Copy") || key.includes("Title") ? "textarea" : "input";
              return (
                <label key={key}>
                  {label} ({activeLang})
                  {Tag === "textarea" ? (
                    <textarea rows={3} value={currentUI[key] || ""} onChange={(e) => updateUIField(key, e.target.value)} />
                  ) : (
                    <input type="text" value={currentUI[key] || ""} onChange={(e) => updateUIField(key, e.target.value)} />
                  )}
                </label>
              );
            })}
          </div>
        </section>

        {/* Products */}
        <section className="panel" id="products">
          <div className="panel-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2>商品</h2>
              <p>{content.products.length} 个商品</p>
            </div>
            <button className="btn btn-primary btn-compact" onClick={addProduct}>+ 添加商品</button>
          </div>
          {content.products.map((p, i) => {
            const title = (p.title as Record<string, string>)?.zh || "未命名";
            return (
              <div key={i} className="edit-card">
                <h3>{(p.code as string) || "NEW"} · {title}</h3>
                <div className="simple-fields">
                  <label>Code <input type="text" value={(p.code as string) || ""} onChange={(e) => updateProductField(i, "code", e.target.value)} /></label>
                  <label>分类
                    <select value={(p.category as string) || "desk"} onChange={(e) => updateProductField(i, "category", e.target.value)}>
                      <option value="restaurant">餐厅</option><option value="party">派对</option><option value="desk">桌面</option>
                    </select>
                  </label>
                  <label>价格 <input type="number" step="0.01" value={(p.price as number) || 0} onChange={(e) => updateProductField(i, "price", Number(e.target.value))} /></label>
                  <label>图片 <input type="text" value={(p.image as string) || ""} onChange={(e) => updateProductField(i, "image", e.target.value)} /></label>
                  <label>格式 (逗号分隔) <input type="text" value={((p.formats as string[]) || []).join(", ")} onChange={(e) => updateProductField(i, "formats", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} /></label>
                  <label>难度
                    <select value={(p.difficulty as string) || "easy"} onChange={(e) => updateProductField(i, "difficulty", e.target.value)}>
                      <option value="easy">新手友好</option><option value="medium">进阶打印</option>
                    </select>
                  </label>
                </div>
                <div className="multi-grid">
                  {LANGS.map((l) => (
                    <fieldset key={l}>
                      <legend>{LANG_LABELS[l]}</legend>
                      <label>名称 <input type="text" value={((p.title as Record<string, string>) || {})[l] || ""} onChange={(e) => updateProductLang(i, "title", l, e.target.value)} /></label>
                      <label>描述 <textarea rows={2} value={((p.meta as Record<string, string>) || {})[l] || ""} onChange={(e) => updateProductLang(i, "meta", l, e.target.value)} /></label>
                      <label>信息 <textarea rows={2} value={((p.stats as Record<string, string>) || {})[l] || ""} onChange={(e) => updateProductLang(i, "stats", l, e.target.value)} /></label>
                    </fieldset>
                  ))}
                </div>
                <button className="remove-btn-admin" onClick={() => removeProduct(i)}>❌ 删除</button>
              </div>
            );
          })}
        </section>

        {/* Bundles */}
        <section className="panel" id="bundles">
          <div className="panel-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2>套装</h2>
              <p>{content.bundles.length} 个套装</p>
            </div>
            <button className="btn btn-primary btn-compact" onClick={addBundle}>+ 添加套装</button>
          </div>
          {content.bundles.map((b, i) => {
            const title = (b.title as Record<string, string>)?.zh || "未命名";
            return (
              <div key={i} className="edit-card">
                <h3>{title}</h3>
                <div className="simple-fields">
                  <label>价格 <input type="number" step="0.01" value={(b.price as number) || 0} onChange={(e) => updateBundleField(i, "price", Number(e.target.value))} /></label>
                  <label>图片 <input type="text" value={(b.image as string) || ""} onChange={(e) => updateBundleField(i, "image", e.target.value)} /></label>
                </div>
                <div className="multi-grid">
                  {LANGS.map((l) => (
                    <fieldset key={l}>
                      <legend>{LANG_LABELS[l]}</legend>
                      <label>名称 <input type="text" value={((b.title as Record<string, string>) || {})[l] || ""} onChange={(e) => updateBundleLang(i, "title", l, e.target.value)} /></label>
                      <label>描述 <textarea rows={2} value={((b.description as Record<string, string>) || {})[l] || ""} onChange={(e) => updateBundleLang(i, "description", l, e.target.value)} /></label>
                    </fieldset>
                  ))}
                </div>
                <button className="remove-btn-admin" onClick={() => removeBundle(i)}>❌ 删除</button>
              </div>
            );
          })}
        </section>

        {/* Backup */}
        <section className="panel" id="backup">
          <div className="panel-head">
            <h2>备份恢复</h2>
            <p>导出/导入/重置所有内容。</p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
            <button className="btn btn-secondary btn-compact" onClick={exportBackup}>📥 导出备份</button>
            <button className="btn btn-secondary btn-compact" onClick={() => importRef.current?.click()}>📤 导入备份</button>
            <input ref={importRef} type="file" accept=".json" style={{ display: "none" }} onChange={importBackup} />
            <button className="btn btn-secondary btn-compact" onClick={resetDefaults} style={{ color: "#f43f5e", borderColor: "#f43f5e" }}>🔄 恢复默认</button>
          </div>
        </section>
      </main>

      <div id="admin-toast" className="status-toast" />
    </div>
  );
}
