"use client";

type HeardFrom = "internet" | "social" | "medical" | "other" | "";

export default function HeardFromBlock({
  t,
  heardFrom,
  setHeardFrom,
  heardFromOther,
  setHeardFromOther,
}: {
  t: any;
  heardFrom: HeardFrom;
  setHeardFrom: (v: HeardFrom) => void;
  heardFromOther: string;
  setHeardFromOther: (v: string) => void;
}) {
  return (
    <section className="checkout-section">
      <h2 className="checkout-subtitle">{t.heardFromQuestion}</h2>

      <div className="checkout-radio-group">
        {(["internet", "social", "medical", "other"] as const).map((k) => (
          <label key={k} className="checkout-radio-item">
            <input
              type="radio"
              name="heardFrom"
              value={k}
              checked={heardFrom === k}
              onChange={() => setHeardFrom(k)}
            />
            <span>
              {k === "internet"
                ? t.heardFromInternet
                : k === "social"
                ? t.heardFromSocial
                : k === "medical"
                ? t.heardFromMedical
                : t.heardFromOther}
            </span>
          </label>
        ))}
      </div>

      {heardFrom === "other" && (
        <div className="checkout-heardfrom-other">
          <input
            className="checkout-input"
            placeholder={t.heardFromOtherPlaceholder}
            value={heardFromOther}
            onChange={(e) => setHeardFromOther(e.target.value)}
          />
        </div>
      )}
    </section>
  );
}
