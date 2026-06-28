"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import "./login.css";

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [info, setInfo] =
    useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      password.trim().length > 0 &&
      !loading
    );
  }, [password, loading]);

  const handleLogin = async () => {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const res = await fetch(
        "/api/admin-login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            password,
          }),
        }
      );

      const data = await res
        .json()
        .catch(() => ({}));

      if (res.status === 429) {
        setError(
          `Trop de tentatives. Réessaie dans ${
            data.retryAfterMinutes ?? 10
          } min.`
        );

        return;
      }

      if (!res.ok) {
        setError(
          "Mot de passe incorrect"
        );

        return;
      }

      setInfo(
        "Connexion sécurisée..."
      );

      router.replace(
        data?.role === "logistics"
          ? "/admin/logistics"
          : "/admin"
      );
    } catch {
      setError(
        "Erreur de connexion"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">

      {/* BACKGROUND */}
      <div className="admin-login-grid" />

      <div className="admin-login-glow admin-login-glow-1" />

      <div className="admin-login-glow admin-login-glow-2" />

      <div className="admin-login-noise" />

      {/* CONTENT */}
      <div className="admin-login-wrapper">

        {/* HERO */}
        <section className="admin-login-hero">

          <div className="admin-login-kicker">
            Secure Admin Access
          </div>

          <h1 className="admin-login-title">
            Administration
            <span> Panel</span>
          </h1>

          <p className="admin-login-description">
            Interface sécurisée de gestion
            et pilotage des opérations.
          </p>

          {/* FEATURES */}
          <div className="admin-login-features">

            <div className="admin-login-feature">

              <div className="admin-login-feature-icon">
                🔐
              </div>

              <div>

                <strong>
                  Accès sécurisé
                </strong>

                <span>
                  Infrastructure protégée et
                  authentification avancée
                </span>

              </div>

            </div>

            <div className="admin-login-feature">

              <div className="admin-login-feature-icon">
                ⚡
              </div>

              <div>

                <strong>
                  Performance optimisée
                </strong>

                <span>
                  Interface fluide conçue
                  pour une gestion rapide
                </span>

              </div>

            </div>

            <div className="admin-login-feature">

              <div className="admin-login-feature-icon">
                🧠
              </div>

              <div>

                <strong>
                  Gestion centralisée
                </strong>

                <span>
                  Pilotage intelligent des
                  opérations et du contenu
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* CARD */}
        <section className="admin-login-card">

          <div className="admin-login-card-glow" />

          <div className="admin-login-card-content">

            {/* HEADER */}
            <div className="admin-login-card-header">

              <div className="admin-login-badge">
                ADMIN ACCESS
              </div>

              <h2>
                Connexion sécurisée
              </h2>

              <p>
                Authentifie-toi pour accéder
                à l’interface d’administration.
              </p>

            </div>

            {/* FORM */}
            <div className="admin-login-form">

              <div className="admin-login-field">

                <label>
                  Mot de passe
                </label>

                <div className="admin-login-input-wrap">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Entrer le mot de passe"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter"
                      ) {
                        handleLogin();
                      }
                    }}
                    className="admin-login-input"
                  />

                  <button
                    type="button"
                    className="admin-login-eye"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>

              </div>

              {(error || info) && (
                <div
                  className={`admin-login-alert ${
                    error
                      ? "is-error"
                      : "is-info"
                  }`}
                >
                  {error ?? info}
                </div>
              )}

              <button
                className="admin-login-submit"
                disabled={!canSubmit}
                onClick={handleLogin}
              >
                <span>
                  {loading
                    ? "Connexion..."
                    : "Accéder au dashboard"}
                </span>
              </button>

            </div>

          </div>

        </section>

        {/* FOOTER */}
        <footer className="admin-login-footer">

          <span>
            Powered by
          </span>

          <strong>
            HDConnects
          </strong>

        </footer>

      </div>

    </main>
  );
}
