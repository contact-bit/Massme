"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Si déjà connecté → redirection vers /admin
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("admin_token");
    if (token) {
      router.replace("/admin");
    }
  }, [router]);

  const handleLogin = async () => {
    if (!password) return;

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        const minutes = data.retryAfterMinutes ?? 10;
        setError(
          `Trop de tentatives. Réessaie dans environ ${minutes} minute${
            minutes > 1 ? "s" : ""
          }.`
        );
        return;
      }

      if (!res.ok) {
        if (typeof data.remainingAttempts === "number") {
          setError(
            `Mot de passe incorrect 🚫 (Essais restants : ${data.remainingAttempts})`
          );
        } else {
          setError("Mot de passe incorrect 🚫");
        }
        return;
      }

      // ✅ Login OK
      localStorage.setItem("admin_token", "true");
      setInfo("Connexion réussie, redirection…");
      router.replace("/admin");
    } catch (err) {
      console.error("Erreur login admin :", err);
      setError("Erreur de connexion. Réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-box">
        <h1 className="admin-login-title">🔐 Admin MassMe</h1>
        <p className="admin-login-subtitle">
          Accès réservé &mdash; tentative limitée pour des raisons de sécurité.
        </p>

        <div className="admin-login-field">
          <label className="admin-login-label" htmlFor="admin-password">
            Mot de passe
          </label>
          <input
            id="admin-password"
            type="password"
            placeholder="Entrez le mot de passe admin"
            className="admin-login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin();
              }
            }}
          />
        </div>

        {error && (
          <p className="admin-login-error">
            {error}
          </p>
        )}

        {info && !error && (
          <p className="admin-login-info">
            {info}
          </p>
        )}

        <button
          className="admin-login-button"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>

        <p className="admin-login-footnote">
          Pour toute tentative non autorisée, l’accès peut être temporairement
          bloqué.
        </p>
      </div>
    </div>
  );
}
