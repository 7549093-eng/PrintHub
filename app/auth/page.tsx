"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function AuthPage() {
  const { user, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(""); setError("");
    if (mode === "login") {
      const result = await signIn(email, password);
      if (result.error) setError(result.error);
      else setMsg("登录成功！");
    } else {
      if (password.length < 6) { setError("密码至少 6 位"); return; }
      const result = await signUp(email, password);
      if (result.error) setError(result.error);
      else setMsg("注册成功！请检查邮箱验证。");
    }
  };

  if (user) {
    return (
      <div style={{
        maxWidth: "480px", margin: "80px auto", padding: "32px",
        borderRadius: "16px", border: "1px solid var(--color-line)", background: "var(--color-surface)",
      }}>
        <h2 style={{ margin: "0 0 16px" }}>已登录</h2>
        <p style={{ color: "var(--color-muted)", marginBottom: "16px" }}>
          邮箱: {user.email}
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link className="btn btn-primary btn-compact" href="/">返回首页</Link>
          <button className="btn btn-secondary btn-compact" onClick={signOut}>退出登录</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: "480px", margin: "80px auto", padding: "32px",
      borderRadius: "16px", border: "1px solid var(--color-line)", background: "var(--color-surface)",
    }}>
      <h2 style={{ margin: "0 0 24px" }}>
        {mode === "login" ? "登录 PrintHub" : "注册 PrintHub"}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px", color: "var(--color-muted)" }}>
          邮箱
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--color-line)",
              background: "var(--color-bg)", color: "var(--color-text)", fontSize: "14px", outline: "none",
            }}
            placeholder="you@example.com"
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px", color: "var(--color-muted)" }}>
          密码
          <input
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--color-line)",
              background: "var(--color-bg)", color: "var(--color-text)", fontSize: "14px", outline: "none",
            }}
            placeholder={mode === "register" ? "至少 6 位" : ""}
          />
        </label>

        {error && <p style={{ color: "#f43f5e", fontSize: "13px", margin: 0 }}>{error}</p>}
        {msg && <p style={{ color: "var(--color-accent)", fontSize: "13px", margin: 0 }}>{msg}</p>}

        <button className="btn btn-primary" type="submit">
          {mode === "login" ? "登录" : "注册"}
        </button>
      </form>

      <p style={{ marginTop: "16px", fontSize: "13px", color: "var(--color-muted)", textAlign: "center" }}>
        {mode === "login" ? "还没有账号？" : "已有账号？"}
        <button
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setMsg(""); setError(""); }}
          style={{ border: "none", background: "none", color: "var(--color-accent)", cursor: "pointer", fontWeight: 600 }}
        >
          {mode === "login" ? "立即注册" : "去登录"}
        </button>
      </p>
    </div>
  );
}
