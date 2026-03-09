// src/app/admin/login/page.tsx
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

  const canSubmit = useMemo(() => password.trim().length > 0 && !loading, [password, loading]);

  // Déjà connecté -> /admin
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("admin_token");
    if (token) router.replace("/admin");
  }, [router]);

  const handleLogin = async () => {
    if (!password || loading) return;

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
        setError(`Trop de tentatives. Réessaie dans environ ${minutes} minute${minutes > 1 ? "s" : ""}.`);
        return;
      }

      if (!res.ok) {
        if (typeof data.remainingAttempts === "number") {
          setError(`Mot de passe incorrect 🚫 (Essais restants : ${data.remainingAttempts})`);
        } else {
          setError("Mot de passe incorrect 🚫");
        }
        return;
      }

      // ✅ Login OK
localStorage.setItem("admin_token", "true");
localStorage.setItem("admin_password", password);
localStorage.setItem("admin_role", data?.role === "logistics" ? "logistics" : "admin");

setInfo("Connexion réussie, redirection…");
router.replace(data?.role === "logistics" ? "/admin/logistics" : "/admin");
    } catch (err) {
      console.error("Erreur login admin :", err);
      setError("Erreur de connexion. Réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="al-page">
      {/* Background */}
      <div className="al-bg" aria-hidden />
      <div className="al-grid" aria-hidden />

      <section className="al-shell">
        <div className="al-card">
          <div className="al-head">
            <div className="al-logo" aria-hidden>
              <span className="al-logo-mark" />
            </div>

            <div className="al-titles">
              <h1 className="al-title">Admin OculaRest</h1>
              <p className="al-sub">
                Accès réservé — tentatives limitées pour des raisons de sécurité.
              </p>
            </div>
          </div>

          <div className="al-form">
            <label className="al-label" htmlFor="admin-password">
              Mot de passe
            </label>

            <div className="al-input-wrap">
              <input
                id="admin-password"
                type={show ? "text" : "password"}
                placeholder="Entrez le mot de passe admin"
                className="al-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin();
                }}
                autoFocus
              />

              <button
                type="button"
                className="al-eye"
                onClick={() => setShow((v) => !v)}
                title={show ? "Masquer" : "Afficher"}
                aria-label={show ? "Masquer" : "Afficher"}
              >
                {show ? "🙈" : "👁️"}
              </button>
            </div>

            {(error || info) && (
              <div className={`al-alert ${error ? "is-error" : "is-info"}`}>
                <div className="al-alert-ic" aria-hidden>
                  {error ? "⚠" : "✓"}
                </div>
                <div className="al-alert-txt">{error ?? info}</div>
              </div>
            )}

            <button
              className={`al-btn ${canSubmit ? "is-on" : ""}`}
              onClick={handleLogin}
              disabled={!canSubmit}
            >
              {loading ? (
                <span className="al-btn-row">
                  <span className="al-spin" aria-hidden />
                  Connexion…
                </span>
              ) : (
                <span className="al-btn-row">
                  Se connecter <span className="al-btn-arrow">→</span>
                </span>
              )}
            </button>

            <div className="al-foot">
              <div className="al-foot-row">
                <span className="al-kbd">Entrée</span>
                <span className="al-foot-muted">pour valider</span>
              </div>
              <p className="al-note">
                En cas de tentatives non autorisées, l’accès peut être temporairement bloqué.
              </p>
            </div>
          </div>
        </div>

        <div className="al-side">
          <div className="al-side-card">
            <div className="al-side-title">Accès sécurisé</div>
            <div className="al-side-desc">
              Cette zone admin est protégée (rate-limit + vérification côté serveur).<br />
              Utilise uniquement le mot de passe fourni.
            </div>

            <div className="al-bullets">
              <div className="al-bullet">
                <span className="al-dot" aria-hidden />
                <span>Connexion rapide</span>
              </div>
              <div className="al-bullet">
                <span className="al-dot" aria-hidden />
                <span>Notifications & commandes</span>
              </div>
              <div className="al-bullet">
                <span className="al-dot" aria-hidden />
                <span>Gestion stock & livraison</span>
              </div>
            </div>
          </div>

          <div className="al-mini">
            <span className="al-mini-badge">OculaRest</span>
            <span className="al-mini-muted">Admin</span>
          </div>
        </div>
      </section>

      <style jsx>{`
        .al-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 22px 16px;
          position: relative;
          overflow: hidden;
          background: #f6f8fb;
        }

        .al-bg {
          position: absolute;
          inset: -40%;
          background:
            radial-gradient(closest-side at 20% 25%, rgba(37,99,235,.20), rgba(37,99,235,0) 55%),
            radial-gradient(closest-side at 80% 35%, rgba(16,185,129,.16), rgba(16,185,129,0) 55%),
            radial-gradient(closest-side at 50% 85%, rgba(245,158,11,.14), rgba(245,158,11,0) 55%);
          filter: blur(12px);
          opacity: 0.9;
          pointer-events: none;
        }

        .al-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(to right, rgba(11,18,32,.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(11,18,32,.06) 1px, transparent 1px);
          background-size: 56px 56px;
          opacity: 0.18;
          mask-image: radial-gradient(closest-side, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 85%);
          pointer-events: none;
        }

        .al-shell {
          width: min(980px, 100%);
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        .al-card {
          border: 1px solid rgba(11,18,32,.10);
          border-radius: 22px;
          background: rgba(255,255,255,.92);
          box-shadow: 0 24px 70px rgba(11,18,32,.10);
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .al-head {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 18px 14px;
          border-bottom: 1px solid rgba(11,18,32,.08);
          background: linear-gradient(180deg, rgba(11,18,32,.02), rgba(11,18,32,0));
        }

        .al-logo {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          background: rgba(37,99,235,.12);
          border: 1px solid rgba(37,99,235,.25);
          box-shadow: 0 16px 30px rgba(37,99,235,.10);
          display: grid;
          place-items: center;
          flex: 0 0 auto;
        }
        .al-logo-mark {
          width: 18px;
          height: 18px;
          border-radius: 8px;
          background: rgba(37,99,235,1);
          display: block;
        }

        .al-titles {
          min-width: 0;
        }

        .al-title {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          letter-spacing: -0.02em;
          color: rgba(11,18,32,.92);
        }

        .al-sub {
          margin: 4px 0 0;
          font-size: 13px;
          color: rgba(11,18,32,.62);
          line-height: 1.3;
        }

        .al-form {
          padding: 16px 18px 18px;
          display: grid;
          gap: 12px;
        }

        .al-label {
          font-size: 12px;
          font-weight: 900;
          color: rgba(11,18,32,.68);
          margin-top: 4px;
        }

        .al-input-wrap {
          position: relative;
        }

        .al-input {
          width: 100%;
          height: 46px;
          border-radius: 14px;
          border: 1px solid rgba(11,18,32,.12);
          padding: 0 44px 0 14px;
          font-size: 14px;
          outline: none;
          color: rgba(11,18,32,.92);
          background: white;
          box-shadow: 0 10px 22px rgba(11,18,32,.04);
        }
        .al-input:focus {
          border-color: rgba(37,99,235,.45);
          box-shadow: 0 0 0 5px rgba(37,99,235,.14), 0 10px 22px rgba(11,18,32,.04);
        }

        .al-eye {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          height: 34px;
          width: 36px;
          border-radius: 12px;
          border: 1px solid rgba(11,18,32,.10);
          background: rgba(11,18,32,.03);
          cursor: pointer;
          display: inline-grid;
          place-items: center;
          font-size: 14px;
        }

        .al-alert {
          border-radius: 14px;
          border: 1px solid rgba(11,18,32,.10);
          padding: 10px 12px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
          background: rgba(11,18,32,.02);
        }
        .al-alert.is-error {
          background: rgba(239,68,68,.08);
          border-color: rgba(239,68,68,.18);
        }
        .al-alert.is-info {
          background: rgba(16,185,129,.10);
          border-color: rgba(16,185,129,.18);
        }
        .al-alert-ic {
          width: 22px;
          height: 22px;
          border-radius: 8px;
          display: grid;
          place-items: center;
          background: rgba(0,0,0,.06);
          flex: 0 0 auto;
          font-weight: 900;
        }
        .al-alert-txt {
          font-size: 13px;
          font-weight: 800;
          color: rgba(11,18,32,.88);
          line-height: 1.25;
        }

        .al-btn {
          height: 46px;
          border-radius: 14px;
          border: 1px solid rgba(11,18,32,.12);
          background: rgba(11,18,32,.03);
          color: rgba(11,18,32,.65);
          font-weight: 950;
          font-size: 14px;
          cursor: pointer;
          transition: transform .08s ease, box-shadow .15s ease, background .15s ease;
        }
        .al-btn.is-on {
          background: rgba(37,99,235,1);
          border-color: rgba(37,99,235,1);
          color: white;
          box-shadow: 0 18px 40px rgba(37,99,235,.22);
        }
        .al-btn:disabled {
          opacity: .65;
          cursor: not-allowed;
        }
        .al-btn:active {
          transform: translateY(1px);
        }
        .al-btn-row {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .al-btn-arrow {
          opacity: .9;
        }

        .al-spin {
          width: 16px;
          height: 16px;
          border-radius: 999px;
          border: 2px solid rgba(255,255,255,.55);
          border-top-color: rgba(255,255,255,1);
          animation: spin .8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .al-foot {
          margin-top: 2px;
          display: grid;
          gap: 8px;
        }
        .al-foot-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .al-kbd {
          font-size: 12px;
          font-weight: 950;
          padding: 4px 8px;
          border-radius: 10px;
          border: 1px solid rgba(11,18,32,.12);
          background: rgba(255,255,255,.8);
          box-shadow: 0 10px 22px rgba(11,18,32,.04);
        }
        .al-foot-muted {
          font-size: 12px;
          color: rgba(11,18,32,.6);
          font-weight: 800;
        }
        .al-note {
          margin: 0;
          font-size: 12px;
          color: rgba(11,18,32,.56);
          line-height: 1.35;
        }

        .al-side {
          display: grid;
          gap: 12px;
          align-content: start;
        }

        .al-side-card {
          border: 1px solid rgba(11,18,32,.10);
          border-radius: 22px;
          background: rgba(255,255,255,.78);
          box-shadow: 0 24px 70px rgba(11,18,32,.08);
          backdrop-filter: blur(10px);
          padding: 18px;
        }

        .al-side-title {
          font-weight: 950;
          font-size: 14px;
          color: rgba(11,18,32,.92);
        }
        .al-side-desc {
          margin-top: 8px;
          font-size: 13px;
          color: rgba(11,18,32,.62);
          line-height: 1.35;
        }

        .al-bullets {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }

        .al-bullet {
          display: flex;
          gap: 10px;
          align-items: center;
          font-size: 13px;
          color: rgba(11,18,32,.82);
          font-weight: 850;
        }
        .al-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: rgba(37,99,235,1);
          box-shadow: 0 10px 22px rgba(37,99,235,.18);
        }

        .al-mini {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
        }
        .al-mini-badge {
          font-weight: 950;
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(11,18,32,.12);
          background: rgba(255,255,255,.75);
          color: rgba(11,18,32,.88);
        }
        .al-mini-muted {
          font-size: 12px;
          color: rgba(11,18,32,.55);
          font-weight: 850;
        }

        @media (max-width: 900px) {
          .al-shell {
            grid-template-columns: 1fr;
          }
          .al-side {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
