"use client";

import "./BillingForm.css";

type BillingCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isProfessional: boolean;
  vatNumber: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
};

type Props = {
  t: any;

  billingCustomer: BillingCustomer;

  setBillingCustomer: (
    v: BillingCustomer
  ) => void;
};

export default function BillingForm({
  t,
  billingCustomer,
  setBillingCustomer,
}: Props) {

  const updateField = (
    field: keyof BillingCustomer,
    value: string | boolean
  ) => {
    setBillingCustomer({
      ...billingCustomer,
      [field]: value,
    });
  };

  return (
    <section className="billing-form">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="billing-form-header">

        <div className="billing-form-badge">
          Informations sécurisées
        </div>

        <div className="billing-form-heading">

          <h2 className="billing-form-title">
            {t.billingAddress}
          </h2>

          <p className="billing-form-description">
            Vos informations sont utilisées uniquement
            pour préparer et sécuriser votre commande.
          </p>

        </div>

      </div>

      {/* =========================================
          NAME GRID
      ========================================= */}

      <div className="billing-form-grid">

        {/* FIRST NAME */}

        <div className="billing-form-field">

          <label className="billing-form-label">
            {t.firstName}
          </label>

          <input
            className="billing-form-input"
            value={
              billingCustomer.firstName
            }
            onChange={(e) =>
              updateField(
                "firstName",
                e.target.value
              )
            }
            autoComplete="given-name"
          />

        </div>

        {/* LAST NAME */}

        <div className="billing-form-field">

          <label className="billing-form-label">
            {t.lastName}
          </label>

          <input
            className="billing-form-input"
            value={
              billingCustomer.lastName
            }
            onChange={(e) =>
              updateField(
                "lastName",
                e.target.value
              )
            }
            autoComplete="family-name"
          />

        </div>

      </div>

      {/* =========================================
          EMAIL
      ========================================= */}

      <div className="billing-form-field billing-form-field-large">

        <div className="billing-form-field-top">

          <label className="billing-form-label">
            {t.email}
          </label>

          {billingCustomer.email.trim()
            .length > 3 && (
            <span className="billing-form-valid">
              ✓
            </span>
          )}

        </div>

        <input
          className="billing-form-input billing-form-input-prominent"
          type="email"
          value={
            billingCustomer.email
          }
          onChange={(e) =>
            updateField(
              "email",
              e.target.value
            )
          }
          autoComplete="email"
        />

        <p className="billing-form-help">
          Confirmation et suivi de commande envoyés par email.
        </p>

      </div>

      {/* =========================================
          PHONE
      ========================================= */}

      <div className="billing-form-field billing-form-field-large">

        <div className="billing-form-field-top">

          <label className="billing-form-label">
            {t.phone}
          </label>

          {billingCustomer.phone.trim()
            .length > 5 && (
            <span className="billing-form-valid">
              ✓
            </span>
          )}

        </div>

        <input
          className="billing-form-input"
          type="tel"
          value={
            billingCustomer.phone
          }
          onChange={(e) =>
            updateField(
              "phone",
              e.target.value
            )
          }
          autoComplete="tel"
        />

        <p className="billing-form-help">
          {t.phoneHelp}
        </p>

      </div>

      {/* =========================================
          PROFESSIONAL
      ========================================= */}

      <label className="billing-form-professional">

        <input
          type="checkbox"
          checked={
            billingCustomer.isProfessional
          }
          onChange={(e) =>
            updateField(
              "isProfessional",
              e.target.checked
            )
          }
        />

        <span className="billing-form-professional-check" />

        <span className="billing-form-professional-content">
          <strong>
            Je suis professionnel
          </strong>

          <small>
            Ajouter les informations de TVA
            intracommunautaire à la commande.
          </small>
        </span>

      </label>

      {billingCustomer.isProfessional && (
        <div className="billing-form-field billing-form-field-large">

          <label className="billing-form-label">
            TVA intracommunautaire
          </label>

          <input
            className="billing-form-input"
            value={
              billingCustomer.vatNumber
            }
            onChange={(e) =>
              updateField(
                "vatNumber",
                e.target.value
              )
            }
            placeholder="FR12345678901"
            autoComplete="off"
          />

          <p className="billing-form-help">
            Ce numéro sera rattaché aux
            informations de facturation.
          </p>

        </div>
      )}

      {/* =========================================
          ADDRESS
      ========================================= */}

      <div className="billing-form-field billing-form-field-large">

        <label className="billing-form-label">
          {t.address}
        </label>

        <input
          className="billing-form-input"
          value={
            billingCustomer.address
          }
          onChange={(e) =>
            updateField(
              "address",
              e.target.value
            )
          }
          autoComplete="street-address"
        />

      </div>

      {/* =========================================
          CITY GRID
      ========================================= */}

      <div className="billing-form-grid">

        {/* POSTAL CODE */}

        <div className="billing-form-field">

          <label className="billing-form-label">
            {t.postalCode}
          </label>

          <input
            className="billing-form-input"
            value={
              billingCustomer.postalCode
            }
            onChange={(e) =>
              updateField(
                "postalCode",
                e.target.value
              )
            }
            autoComplete="postal-code"
          />

        </div>

        {/* CITY */}

        <div className="billing-form-field">

          <label className="billing-form-label">
            {t.city}
          </label>

          <input
            className="billing-form-input"
            value={
              billingCustomer.city
            }
            onChange={(e) =>
              updateField(
                "city",
                e.target.value
              )
            }
            autoComplete="address-level2"
          />

        </div>

      </div>

      {/* =========================================
          TRUST
      ========================================= */}

      <div className="billing-form-trust">

        <div className="billing-form-trust-item">
          🔒 Paiement sécurisé
        </div>

        <div className="billing-form-trust-item">
          ✨ Données chiffrées
        </div>

        <div className="billing-form-trust-item">
          📦 Suivi de commande inclus
        </div>

      </div>

    </section>
  );
}
