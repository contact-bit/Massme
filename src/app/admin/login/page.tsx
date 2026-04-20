"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => password.trim().length > 0 && !loading,
    [password, loading]
  );

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) router.replace("/admin");
  }, [router]);

  const handleLogin = async () => {
    if (!canSubmit) return;

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
        setError(
          `Trop de tentatives. Réessaie dans ${
            data.retryAfterMinutes ?? 10
          } min.`
        );
        return;
      }

      if (!res.ok) {
        setError("Mot de passe incorrect");
        return;
      }

      localStorage.setItem("admin_token", "true");
      localStorage.setItem("admin_password", password);
      localStorage.setItem(
        "admin_role",
        data?.role === "logistics" ? "logistics" : "admin"
      );

      setInfo("Connexion réussie...");
      router.replace(
        data?.role === "logistics" ? "/admin/logistics" : "/admin"
      );
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">

      {/* BACKGROUND */}
      <div className="bg" />
      <div className="glow" />

      <div className="wrapper">

        {/* BRAND */}
        <div className="brand">
          <h1>Vitrectomed/admin.com</h1>
          <p>Panneau d'administration sécurisé</p>

          <div className="features">
            <div>🔐 Accès sécurisé</div>
            <div>⚡ Performances élevées</div>
            <div>🧠 Gestion avancée</div>
          </div>
        </div>

        {/* CARD */}
        <div className="card">

          <div className="header">
            <h2>Connexion</h2>
            <span>Accès admin</span>
          </div>

          <div className="form">

            <label>Mot de passe</label>

            <div className="input-wrap">
              <input
                type={show ? "text" : "password"}
                placeholder="Mot de passe admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />

              <button
                type="button"
                className="eye"
                onClick={() => setShow(!show)}
              >
                {show ? "🙈" : "👁️"}
              </button>
            </div>

            {(error || info) && (
              <div className={`alert ${error ? "error" : "info"}`}>
                {error ?? info}
              </div>
            )}

            <button
              className="submit"
              disabled={!canSubmit}
              onClick={handleLogin}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>

          </div>
        </div>

        {/* POWERED */}
        <div className="powered">
          Powered by <span>HDConnects</span>
        </div>

      </div>

      <style jsx>{`

        .page {
          min-height: 100vh;
          background: #020617;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        /* BG */
        .bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 20%, #1e3a8a25, transparent 50%);
        }

        .glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, #3b82f6, transparent);
          filter: blur(180px);
          opacity: 0.12;
        }

        /* STACK */
        .wrapper {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          z-index: 2;
        }

        /* BRAND */
        .brand {
          text-align: center;
        }

        .brand h1 {
          font-size: 34px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .brand p {
          color: #64748b;
          margin-top: 6px;
        }

        .features {
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
          color: #94a3b8;
        }

        /* CARD */
        .card {
          padding: 26px;
          border-radius: 20px;
          background: rgba(15,23,42,0.75);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }

        .header {
          margin-bottom: 20px;
        }

        .header h2 {
          font-size: 20px;
          font-weight: 600;
        }

        .header span {
          font-size: 12px;
          color: #64748b;
        }

        /* FORM */
        .form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        label {
          font-size: 12px;
          color: #94a3b8;
        }

        .input-wrap {
          position: relative;
        }

        input {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          border-radius: 12px;
          background: rgba(2,6,23,0.9);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          transition: all 0.2s ease;
        }

        input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
        }

        .eye {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.7;
        }

        .eye:hover {
          opacity: 1;
        }

        /* ALERT */
        .alert {
          font-size: 13px;
          padding: 10px;
          border-radius: 10px;
        }

        .alert.error {
          background: rgba(239,68,68,0.1);
          color: #f87171;
        }

        .alert.info {
          background: rgba(59,130,246,0.1);
          color: #60a5fa;
        }

        /* BUTTON */
        .submit {
          height: 48px;
          border-radius: 12px;
          font-weight: 600;
          background: linear-gradient(135deg,#3b82f6,#2563eb);
          box-shadow: 0 10px 30px rgba(37,99,235,0.4);
          transition: all 0.2s ease;
        }

        .submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 40px rgba(37,99,235,0.5);
        }

        .submit:disabled {
          opacity: 0.5;
          transform: none;
          box-shadow: none;
        }

        /* POWERED */
        .powered {
          text-align: center;
          font-size: 12px;
          color: #64748b;
        }

        .powered span {
          color: #3b82f6;
          font-weight: 600;
        }

        .powered span:hover {
          text-shadow: 0 0 8px rgba(59,130,246,0.6);
        }

        /* MOBILE */
        @media (max-width: 500px) {
          .wrapper {
            gap: 22px;
          }

          .brand h1 {
            font-size: 26px;
          }

          .card {
            padding: 20px;
          }

          input {
            height: 44px;
          }

          .submit {
            height: 44px;
          }
        }

      `}</style>
    </main>
  );
}