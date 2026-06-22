"use client";

import { type ReactNode, useState, useEffect, useRef } from "react";
import { useStore } from "@/contexts/StoreContext";
import { t, text, money } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";
import { createOrder } from "@/lib/queries";
import type { Lang } from "@/types";
import Link from "next/link";

// ─── Sidebar ─────────────────────────────────────────────────────
function Sidebar() {
  const { lang } = useStore();
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const nav = [
    { href: "#home", key: "navHome" },
    { href: "#free", key: "navFree" },
    { href: "#categories", key: "navCategories" },
    { href: "#catalog", key: "navCatalog" },
    { href: "#memberships", key: "navMemberships" },
    { href: "#account", key: "navAccount" },
    { href: "#bundles", key: "navBundles" },
    { href: "#license", key: "navLicense" },
    { href: "#operations", key: "navOperations" },
    { href: "#services", key: "navServices" },
    { href: "#policies", key: "navPolicies" },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="nav-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="site-nav"
      >
        <span /><span /><span />
      </button>

      <aside ref={sidebarRef} id="site-nav" className={`sidebar ${open ? "open" : ""}`}>
        <Link className="brand" href="#home" aria-label="PrintHub" onClick={() => setOpen(false)}>
          <img className="brand-logo" src="/assets/logo.png" alt="" />
          <span className="brand-copy">
            <strong>PrintHub</strong>
            <small>{t("brandSub", lang)}</small>
          </span>
        </Link>

        <nav className="side-nav" aria-label="Main navigation">
          {nav.map((item) => (
            <a key={item.key} href={item.href} onClick={() => setOpen(false)}>
              {t(item.key, lang)}
            </a>
          ))}
          <Link href="/admin" onClick={() => setOpen(false)}>
            {t("navAdmin", lang)}
          </Link>
        </nav>

        <div className="sidebar-note">
          <strong>{t("sidebarTitle", lang)}</strong>
          <span>{t("sidebarCopy", lang)}</span>
        </div>
      </aside>
    </>
  );
}

// ─── Topbar ──────────────────────────────────────────────────────
function Topbar() {
  const {
    lang, setLang, cart, cartOpen, setCartOpen,
    search, setSearch, setCategory, setSort,
  } = useStore();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const langLabels: Record<Lang, string> = { zh: "🇨🇳 中文", en: "🇬🇧 English", ja: "🇯🇵 日本語", ko: "🇰🇷 한국어" };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    document.querySelector("#catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTag = (tag: string) => {
    setSearch(tag);
    document.querySelector("#catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="topbar">
      <form className="top-search" role="search" onSubmit={handleSearch}>
        <div className="search-row">
          <label htmlFor="global-search">{t("searchLabel", lang)}</label>
          <input
            id="global-search"
            type="search"
            placeholder={t("searchPlaceholder", lang)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
          <button className="btn btn-compact btn-primary" type="submit">
            {t("searchButton", lang)}
          </button>
        </div>
        <div className="search-tags" aria-label="快捷分类搜索">
          {["🧸 玩具", "🛠️ 工具", "🏠 家居", "⚙️ 机械"].map((tag) => (
            <button key={tag} className="search-tag" type="button" onClick={() => handleTag(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </form>

      <div className="top-actions">
        <div className="lang-dropdown" ref={langRef}>
          <button
            className="lang-toggle"
            type="button"
            aria-expanded={langOpen}
            onClick={() => setLangOpen(!langOpen)}
            title={t("languageLabel", lang)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </button>
          {langOpen && (
            <div className="lang-menu">
              {(Object.entries(langLabels) as [Lang, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={key === lang ? "active" : ""}
                  onClick={() => { setLang(key); setLangOpen(false); }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="cart-btn" type="button" onClick={() => setCartOpen(true)}>
          <span>{t("cart", lang)}</span>
          <strong className="count">{cart.length}</strong>
        </button>
      </div>
    </header>
  );
}

// ─── Cart Drawer ─────────────────────────────────────────────────
function CartDrawer() {
  const { lang, cart, cartOpen, setCartOpen, removeFromCart, cartTotal, clearCart } = useStore();
  const { user } = useAuth();
  const [msg, setMsg] = useState("");

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setMsg(t("checkoutEmpty", lang));
      return;
    }
    if (!user) {
      setMsg("请先登录再结账。点击右上角登录按钮。");
      return;
    }
    const orderId = await createOrder(
      user.id, cartTotal,
      cart.map((item) => ({ price: item.price }))
    );
    if (orderId) {
      setMsg(`订单已创建 #${orderId.slice(0, 8)}。支付功能即将上线。`);
      clearCart();
    } else {
      setMsg(t("checkoutSuccess", lang));
    }
  };

  return (
    <div className={`cart-drawer ${cartOpen ? "open" : ""}`} aria-hidden={!cartOpen}>
      <div className="cart-backdrop" onClick={() => setCartOpen(false)} />
      <div className="cart-panel">
        <h2>{t("cartTitle", lang)}</h2>
        <div className="cart-items">
          {cart.length === 0 && <p className="form-note">{t("emptyCart", lang)}</p>}
          {cart.map((item, i) => (
            <div key={i} className="cart-line">
              <div>
                <strong>{text(item.title, lang)}</strong>
                <p>{item.code || ((item.description || item.meta) ? text((item.description || item.meta)!, lang) : t("bundleLabel", lang))}</p>
              </div>
              <div>
                <strong>{money(item.price, lang)}</strong>
                <button className="remove-btn" type="button" onClick={() => removeFromCart(i)}>
                  {t("remove", lang)}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-footer">
          <strong>{money(cartTotal, lang)}</strong>
          <button className="btn btn-primary btn-compact" onClick={handleCheckout}>
            {t("checkoutDemo", lang)}
          </button>
        </div>
        {msg && <p className="checkout-message">{msg}</p>}
      </div>
    </div>
  );
}

// ─── Exported Client Layout ─────────────────────────────────────
export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="page-shell">
        <Topbar />
        {children}
      </div>
      <CartDrawer />
    </>
  );
}
