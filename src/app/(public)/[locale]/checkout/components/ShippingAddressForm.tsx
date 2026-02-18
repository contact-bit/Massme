"use client";

type ShippingCustomer = {
  address: string;
  postalCode: string;
  city: string;
  country: string;
};

export default function ShippingAddressForm({
  t,
  sameAsBilling,
  setSameAsBilling,
  shippingCustomer,
  setShippingCustomer,
}: {
  t: any;
  sameAsBilling: boolean;
  setSameAsBilling: (v: boolean) => void;
  shippingCustomer: ShippingCustomer;
  setShippingCustomer: (v: ShippingCustomer) => void;
}) {
  return (
    <section className="checkout-section">
      <label className="checkout-checkbox">
        <input
          type="checkbox"
          checked={sameAsBilling}
          onChange={(e) => setSameAsBilling(e.target.checked)}
        />
        <span>{t.sameAsBilling}</span>
      </label>

      {!sameAsBilling && (
        <>
          <h2 className="checkout-subtitle">{t.shippingAddress}</h2>

          <input
            className="checkout-input"
            placeholder={t.address}
            value={shippingCustomer.address}
            onChange={(e) =>
              setShippingCustomer({ ...shippingCustomer, address: e.target.value })
            }
          />

          <div className="checkout-grid-2">
            <input
              className="checkout-input"
              placeholder={t.postalCode}
              value={shippingCustomer.postalCode}
              onChange={(e) =>
                setShippingCustomer({
                  ...shippingCustomer,
                  postalCode: e.target.value,
                })
              }
            />
            <input
              className="checkout-input"
              placeholder={t.city}
              value={shippingCustomer.city}
              onChange={(e) =>
                setShippingCustomer({ ...shippingCustomer, city: e.target.value })
              }
            />
          </div>
        </>
      )}
    </section>
  );
}
