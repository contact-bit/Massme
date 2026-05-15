"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import ChooseShipping from "@/components/shipping/ChooseShipping";
import ChoosePayment from "@/components/payment/ChoosePayment";

import CartSummaryInline from "./components/CartSummaryInline";
import BillingForm from "./components/BillingForm";
import ShippingAddressForm from "./components/ShippingAddressForm";
import HeardFrom from "./components/HeardFrom";
import OrderTotals from "./components/OrderTotals";
import PayPalSection from "./components/PayPalSection";
import CheckoutProgress from "./components/CheckoutProgress";

import useCheckout from "./hooks/useCheckout";

import "./checkout.css";

type CheckoutFlowStep =
  | "contact"
  | "shipping"
  | "payment";

export default function CheckoutPage() {

  const {
    locale,
    t,

    safeItems,

    billingCustomer,
    setBillingCustomer,

    shippingCustomer,
    setShippingCustomer,

    sameAsBilling,
    setSameAsBilling,

    heardFrom,
    setHeardFrom,

    heardFromOther,
    setHeardFromOther,

    methods,
    shippingLoading,

    shippingMethod,
    setShippingMethod,

    relayPoint,
    setRelayPoint,

    paymentMethods,

    paymentMethod,
    setPaymentMethod,

    paymentError,

    totals,

    shippingVatRate,
    shippingTTCCents,

    finalTTCCents,

    cartHTCents,
    cartVatCents,

    hasShippingSelected,
    hasPaymentSelected,

    payButtonLabel,

    paypalClientId,
    paypalOptions,
    paypalOrderDocIdRef,

    clearCart,

    pay,
  } = useCheckout();

  /* =====================================================
     FLOW
  ===================================================== */

  const [step, setStep] =
    useState<CheckoutFlowStep>(
      "contact"
    );
/* =====================================================
   AUTO SCROLL TOP ON STEP CHANGE
===================================================== */

useEffect(() => {

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

}, [step]);


  /* =====================================================
     CURRENT STEP
  ===================================================== */

  const currentStep =
    step === "contact"
      ? "billing"
      : step === "shipping"
      ? "shipping"
      : "payment";

  /* =====================================================
     VALIDATIONS
  ===================================================== */

  const canContinueToShipping =
    useMemo(() => {
      return (
        billingCustomer.firstName.trim()
          .length > 0 &&
        billingCustomer.lastName.trim()
          .length > 0 &&
        billingCustomer.email.trim()
          .length > 0 &&
        billingCustomer.phone.trim()
          .length > 0
      );
    }, [billingCustomer]);

  const canContinueToPayment =
    useMemo(() => {
      return (
        !!shippingMethod &&
        shippingCustomer.address.trim()
          .length > 0 &&
        shippingCustomer.postalCode.trim()
          .length > 0 &&
        shippingCustomer.city.trim()
          .length > 0
      );
    }, [
      shippingMethod,
      shippingCustomer,
    ]);

  return (
    <main className="checkout">

      {/* =========================================
          MAIN LAYOUT
      ========================================= */}

      <div className="checkout-layout">

        {/* =========================================
            STICKY SIDEBAR
        ========================================= */}

        <aside className="checkout-progress-shell">

          <CheckoutProgress
            currentStep={currentStep}
            t={t}
          />

        </aside>

        {/* =========================================
            MAIN CONTENT
        ========================================= */}

        <div className="checkout-main">

          <div className="checkout-wrapper">

            {/* =========================================
                HERO
            ========================================= */}

            <header className="checkout-header">

              <div className="checkout-badge">
                {t.securePayment}
              </div>

              <h1 className="checkout-title">
                {t.title}
              </h1>

              <p className="checkout-description">
                {t.checkoutDescription}
              </p>

            </header>

            {/* =========================================
                CART
            ========================================= */}

            <CartSummaryInline />

            {/* =====================================================
                STEP 1 — CONTACT
            ===================================================== */}

            {step === "contact" && (
              <>

                <BillingForm
                  t={t}
                  billingCustomer={
                    billingCustomer
                  }
                  setBillingCustomer={
                    setBillingCustomer
                  }
                />

                <button
                  className={`
                    checkout-pay
                    checkout-pay-large
                    ${
                      canContinueToShipping
                        ? "checkout-pay-active"
                        : ""
                    }
                  `}
                  disabled={
                    !canContinueToShipping
                  }
                  onClick={() =>
                    setStep("shipping")
                  }
                >

                  <div className="checkout-pay-content">

                    <div className="checkout-pay-text">

                      <span className="checkout-pay-label">
                        Étape suivante
                      </span>

                      <strong className="checkout-pay-main">
                        Continuer vers la livraison
                      </strong>

                    </div>

                    <span className="checkout-pay-arrow">
                      →
                    </span>

                  </div>

                </button>

              </>
            )}

            {/* =====================================================
                STEP 2 — SHIPPING
            ===================================================== */}

            {step === "shipping" && (
              <>

                {/* =========================================
                    SHIPPING ADDRESS
                ========================================= */}

                <ShippingAddressForm
                  t={t}
                  sameAsBilling={
                    sameAsBilling
                  }
                  setSameAsBilling={
                    setSameAsBilling
                  }
                  shippingCustomer={
                    shippingCustomer
                  }
                  setShippingCustomer={
                    setShippingCustomer
                  }
                />

                {/* =========================================
                    SHIPPING METHODS
                ========================================= */}

                {shippingLoading ? (
                  <section className="checkout-section">

                    <p className="checkout-loading">
                      {t.loadingShipping}
                    </p>

                  </section>
                ) : (
                  <section className="checkout-section">

                    <div className="checkout-section-top">

                      <div>

                        <span className="checkout-section-kicker">
                          {t.shipping}
                        </span>

                        <h2 className="checkout-subtitle">
                          {t.chooseShippingMethod}
                        </h2>

                      </div>

                      <div
                        className={`
                          checkout-selection-pill
                          ${
                            hasShippingSelected
                              ? ""
                              : "checkout-selection-pill-muted"
                          }
                        `}
                      >
                        {hasShippingSelected
                          ? t.selectedMethod
                          : t.selectionRequired}
                      </div>

                    </div>

                    <div className="checkout-choice-wrapper">

                      <ChooseShipping
                        methods={methods}
                        locale={locale}
                        selectedMethod={shippingMethod}
                        onMethodSelect={setShippingMethod}
                        onRelaySelect={setRelayPoint}
                      />

                    </div>

                  </section>
                )}

                {/* =========================================
                    SHIPPING ACTIONS
                ========================================= */}

                <div className="checkout-payment-bar">

                  <button
                    className="checkout-back-button"
                    onClick={() =>
                      setStep("contact")
                    }
                  >

                    <span className="checkout-back-icon">
                      ←
                    </span>

                    <span>
                      Retour
                    </span>

                  </button>

                  <button
                    className={`
                      checkout-pay
                      checkout-pay-large
                      ${
                        canContinueToPayment
                          ? "checkout-pay-active"
                          : ""
                      }
                    `}
                    disabled={
                      !canContinueToPayment
                    }
                    onClick={() =>
                      setStep("payment")
                    }
                  >

                    <div className="checkout-pay-content">

                      <div className="checkout-pay-text">

                        <span className="checkout-pay-label">
                          Étape suivante
                        </span>

                        <strong className="checkout-pay-main">
                          Continuer vers le paiement
                        </strong>

                      </div>

                      <span className="checkout-pay-arrow">
                        →
                      </span>

                    </div>

                  </button>

                </div>

              </>
            )}

            {/* =====================================================
                STEP 3 — PAYMENT
            ===================================================== */}

            {step === "payment" && (
              <>

                {/* =========================================
                    HEARD FROM
                ========================================= */}

                <HeardFrom
                  t={t}
                  heardFrom={heardFrom}
                  setHeardFrom={setHeardFrom}
                  heardFromOther={heardFromOther}
                  setHeardFromOther={setHeardFromOther}
                />

                {/* =========================================
                    PAYMENT METHODS
                ========================================= */}

                <section className="checkout-section">

                  <div className="checkout-section-top">

                    <div>

                      <span className="checkout-section-kicker">
                        {t.payment}
                      </span>

                      <h2 className="checkout-subtitle">
                        {t.choosePaymentMethod}
                      </h2>

                    </div>

                    <div
                      className={`
                        checkout-selection-pill
                        ${
                          hasPaymentSelected
                            ? ""
                            : "checkout-selection-pill-muted"
                        }
                      `}
                    >
                      {hasPaymentSelected
                        ? t.selectedPayment
                        : t.selectionRequired}
                    </div>

                  </div>

                  <div className="checkout-choice-wrapper">

                    <ChoosePayment
                      methods={paymentMethods}
                      locale={locale}
                      selectedMethod={paymentMethod}
                      onMethodSelect={setPaymentMethod}
                      error={paymentError}
                    />

                  </div>

                </section>

                {/* =========================================
                    PAYMENT ACTIONS
                ========================================= */}

                <div className="checkout-payment-bar">

                  <button
                    className="checkout-back-button"
                    onClick={() =>
                      setStep("shipping")
                    }
                  >

                    <span className="checkout-back-icon">
                      ←
                    </span>

                    <span>
                      Retour
                    </span>

                  </button>

                  <button
                    onClick={pay}
                    disabled={!hasPaymentSelected}
                    className={`
                      checkout-pay
                      checkout-pay-large
                      ${
                        hasPaymentSelected
                          ? "checkout-pay-active"
                          : ""
                      }
                    `}
                  >

                    <div className="checkout-pay-content">

                      <div className="checkout-pay-text">

                        <span className="checkout-pay-label">
                          Paiement sécurisé
                        </span>

                        <strong className="checkout-pay-main">
                          {payButtonLabel}
                        </strong>

                      </div>

                      <span className="checkout-pay-arrow">
                        →
                      </span>

                    </div>

                  </button>

                </div>

                {/* =========================================
                    PAYPAL
                ========================================= */}

                {paymentMethod?.provider ===
                  "paypal" &&
                  (!paypalClientId ? (
                    <section className="checkout-section">

                      <p
                        style={{
                          color: "#fca5a5",
                          fontWeight: 700,
                        }}
                      >
                        {t.paypalUnavailable}
                      </p>

                    </section>
                  ) : (
                    <PayPalSection
                      t={t}
                      locale={locale}
                      paypalOptions={paypalOptions}
                      items={safeItems}
                      shippingMethod={shippingMethod}
                      relayPoint={relayPoint}
                      billingCustomer={billingCustomer}
                      shippingCustomer={shippingCustomer}
                      heardFrom={heardFrom}
                      heardFromOther={heardFromOther}
                      totals={totals}
                      paypalOrderDocIdRef={
                        paypalOrderDocIdRef
                      }
                      clearCart={clearCart}
                    />
                  ))}

                {/* =========================================
                    TOTALS
                ========================================= */}

                <OrderTotals
                  t={t}
                  cartHTCents={cartHTCents}
                  cartVatCents={cartVatCents}
                  shippingTTCCents={shippingTTCCents}
                  shippingVatRate={shippingVatRate}
                  finalTTCCents={finalTTCCents}
                />

              </>
            )}

          </div>

        </div>

      </div>

    </main>
  );
}