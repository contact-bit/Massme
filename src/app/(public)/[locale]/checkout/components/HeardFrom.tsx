"use client";

import "./HeardFrom.css";

type HeardFrom =
  | "internet"
  | "social"
  | "medical"
  | "other"
  | "";

type Props = {
  t: any;

  heardFrom: HeardFrom;

  setHeardFrom: (
    v: HeardFrom
  ) => void;

  heardFromOther: string;

  setHeardFromOther: (
    v: string
  ) => void;
};

export default function HeardFrom({
  t,
  heardFrom,
  setHeardFrom,
  heardFromOther,
  setHeardFromOther,
}: Props) {

  const options = [
    {
      key: "internet",
      label:
        t.heardFromInternet,
      icon: "🌐",
    },

    {
      key: "social",
      label:
        t.heardFromSocial,
      icon: "📱",
    },

    {
      key: "medical",
      label:
        t.heardFromMedical,
      icon: "🏥",
    },

    {
      key: "other",
      label:
        t.heardFromOther,
      icon: "✨",
    },
  ] as const;

  return (
    <section className="heard-from">

      {/* HEADER */}

      <div className="heard-from-header">

        <span className="heard-from-kicker">
          Retour d’expérience
        </span>

        <div>

          <h2 className="heard-from-title">
            {t.heardFromQuestion}
          </h2>

          <p className="heard-from-description">
            Cette information nous aide à améliorer
            l’expérience VitrectoMed.
          </p>

        </div>

      </div>

      {/* OPTIONS */}

      <div className="heard-from-options">

        {options.map(
          (option) => {

            const isActive =
              heardFrom ===
              option.key;

            return (
              <label
                key={
                  option.key
                }
                className={`
                  heard-from-option
                  ${
                    isActive
                      ? "heard-from-option-active"
                      : ""
                  }
                `}
              >

                <input
                  type="radio"
                  name="heardFrom"
                  value={
                    option.key
                  }
                  checked={
                    isActive
                  }
                  onChange={() =>
                    setHeardFrom(
                      option.key
                    )
                  }
                  className="heard-from-radio"
                />

                <div className="heard-from-option-left">

                  <span className="heard-from-icon">
                    {
                      option.icon
                    }
                  </span>

                  <span className="heard-from-label">
                    {
                      option.label
                    }
                  </span>

                </div>

                <div className="heard-from-check" />

              </label>
            );
          }
        )}

      </div>

      {/* OTHER */}

      {heardFrom ===
        "other" && (

        <div className="heard-from-other">

          <input
            className="heard-from-input"
            placeholder={
              t.heardFromOtherPlaceholder
            }
            value={
              heardFromOther
            }
            onChange={(e) =>
              setHeardFromOther(
                e.target.value
              )
            }
          />

        </div>
      )}

    </section>
  );
}