"use client";

import "./ShippingAddressForm.css";

type ShippingCustomer = {
  address: string;
  postalCode: string;
  city: string;
  country: string;
};

type Props = {
  t: any;

  sameAsBilling: boolean;

  setSameAsBilling: (
    v: boolean
  ) => void;

  shippingCustomer: ShippingCustomer;

  setShippingCustomer: (
    v: ShippingCustomer
  ) => void;
};

export default function ShippingAddressForm({
  t,
  sameAsBilling,
  setSameAsBilling,
  shippingCustomer,
  setShippingCustomer,
}: Props) {

  const updateField = (
    field: keyof ShippingCustomer,
    value: string
  ) => {

    setShippingCustomer({
      ...shippingCustomer,
      [field]: value,
    });
  };

  return (
    <section className="shipping-address">

      {/* HEADER */}

      <div className="shipping-address-header">

        <span className="shipping-address-kicker">
          Livraison
        </span>

        <div>

          <h2 className="shipping-address-title">
            {t.shippingAddress}
          </h2>

          <p className="shipping-address-description">
            Vérifiez soigneusement vos informations
            de livraison avant le paiement.
          </p>

        </div>

      </div>

      {/* SAME AS BILLING */}

      <label className="shipping-address-toggle">

        <input
          type="checkbox"
          checked={sameAsBilling}
          onChange={(e) =>
            setSameAsBilling(
              e.target.checked
            )
          }
          className="shipping-address-checkbox"
        />

        <div className="shipping-address-toggle-indicator" />

        <div className="shipping-address-toggle-content">

          <span className="shipping-address-toggle-title">
            {t.sameAsBilling}
          </span>

          <span className="shipping-address-toggle-description">
            Utiliser les mêmes informations
            que la facturation.
          </span>

        </div>

      </label>

      {/* FORM */}

      {!sameAsBilling && (

        <div className="shipping-address-form">

          {/* ADDRESS */}

          <div className="shipping-address-field">

            <label className="shipping-address-label">
              {t.address}
            </label>

            <input
              className="shipping-address-input"
              value={
                shippingCustomer.address
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

          {/* GRID */}

          <div className="shipping-address-grid">

            <div className="shipping-address-field">

              <label className="shipping-address-label">
                {t.postalCode}
              </label>

              <input
                className="shipping-address-input"
                value={
                  shippingCustomer.postalCode
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

            <div className="shipping-address-field">

              <label className="shipping-address-label">
                {t.city}
              </label>

              <input
                className="shipping-address-input"
                value={
                  shippingCustomer.city
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

        </div>
      )}

    </section>
  );
}