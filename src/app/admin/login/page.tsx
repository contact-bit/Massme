"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        alert("Mot de passe incorrect 🚫");
        return;
      }

      // ✅ On aligne avec le layout : "admin_token"
      localStorage.setItem("admin_token", "true");
      router.replace("/admin");
    } catch (err) {
      console.error("Erreur login admin :", err);
      alert("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-box">
        <h1 className="admin-login-title">🔐 Admin MassMe</h1>

        <input
          type="password"
          placeholder="Mot de passe"
          className="admin-login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="admin-login-button"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </div>
    </div>
  );
}
