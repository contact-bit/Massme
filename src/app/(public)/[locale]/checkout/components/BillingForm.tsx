"use client";

import type { Locale } from "@/lib/i18n";

type BillingCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
};

export default function BillingForm({
  t,
  billingCustomer,
  setBillingCustomer,
}: {
  t: any;
  billingCustomer: BillingCustomer;
  setBillingCustomer: (v: BillingCustomer) => void;
}) {
  return (
    <section className="checkout-section">
      <h2 className="checkout-subtitle">{t.billingAddress}</h2>

      <div className="checkout-grid-2">
        <input
          className="checkout-input"
          placeholder={t.firstName}
          value={billingCustomer.firstName}
          onChange={(e) =>
            setBillingCustomer({ ...billingCustomer, firstName: e.target.value })
          }
        />
        <input
          className="checkout-input"
          placeholder={t.lastName}
          value={billingCustomer.lastName}
          onChange={(e) =>
            setBillingCustomer({ ...billingCustomer, lastName: e.target.value })
          }
        />
      </div>

      <input
        className="checkout-input"
        type="email"
        placeholder={t.email}
        value={billingCustomer.email}
        onChange={(e) =>
          setBillingCustomer({ ...billingCustomer, email: e.target.value })
        }
      />

      <div className="checkout-phone-wrapper">
        <input
          className="checkout-input"
          type="tel"
          placeholder={t.phone}
          value={billingCustomer.phone}
          onChange={(e) =>
            setBillingCustomer({ ...billingCustomer, phone: e.target.value })
          }
        />
        <p className="checkout-help-text">{t.phoneHelp}</p>
      </div>

      <input
        className="checkout-input"
        placeholder={t.address}
        value={billingCustomer.address}
        onChange={(e) =>
          setBillingCustomer({ ...billingCustomer, address: e.target.value })
        }
      />

      <div className="checkout-grid-2">
        <input
          className="checkout-input"
          placeholder={t.postalCode}
          value={billingCustomer.postalCode}
          onChange={(e) =>
            setBillingCustomer({ ...billingCustomer, postalCode: e.target.value })
          }
        />
        <input
          className="checkout-input"
          placeholder={t.city}
          value={billingCustomer.city}
          onChange={(e) =>
            setBillingCustomer({ ...billingCustomer, city: e.target.value })
          }
        />
      </div>
    </section>
  );
}
