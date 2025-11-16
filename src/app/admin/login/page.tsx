"use client";

import { useState, useEffect } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("admin_auth") === "true") {
      window.location.href = "/admin";
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);

    const res = await fetch("/api/admin-login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      localStorage.setItem("admin_auth", "true");
      window.location.href = "/admin";
    } else {
      alert("Mot de passe incorrect 🚫");
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
