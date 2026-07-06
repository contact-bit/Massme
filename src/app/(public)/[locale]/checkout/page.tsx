"use client";

import Link from "next/link";
import {
  CreditCard,
  Headphones,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";

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
    isHydrated,

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

  if (!isHydrated) {
    return (
      <main className="checkout checkout-state-page">
        <section className="checkout-state-card">
          <p>Chargement de votre panier…</p>
        </section>
      </main>
    );
  }

  if (safeItems.length === 0) {
    return (
      <main className="checkout checkout-state-page">
        <section className="checkout-state-card">
          <ShoppingCart size={42} aria-hidden="true" />
          <h1>Votre panier est vide</h1>
          <p>Ajoutez le dispositif VitrectoMed avant de poursuivre votre commande.</p>
          <Link href={`/${locale}/convalescence/coussin`}>
            Découvrir le coussin VitrectoMed
          </Link>
        </section>
      </main>
    );
  }

  const stepNumber =
    step === "contact" ? 1 : step === "shipping" ? 2 : 3;

  const stepCopy =
    step === "contact"
      ? {
          eyebrow: "Étape 1 sur 3",
          title: "Vos informations",
          description: "Les coordonnées nécessaires pour préparer et suivre votre commande.",
        }
      : step === "shipping"
      ? {
          eyebrow: "Étape 2 sur 3",
          title: "Votre livraison",
          description: "Choisissez l’adresse et le mode de livraison qui vous conviennent.",
        }
      : {
          eyebrow: "Étape 3 sur 3",
          title: "Paiement sécurisé",
          description: "Vérifiez le total puis choisissez votre moyen de paiement.",
        };

  return (
    <main className="checkout">
      <div className="checkout-shell">
        <header className="checkout-header">
          <div className="checkout-header-copy">
            <div className="checkout-badge">
              <ShieldCheck size={16} aria-hidden="true" />
              {t.securePayment}
            </div>
            <h1 className="checkout-title">Finaliser votre commande</h1>
            <p className="checkout-description">
              Un parcours simple en trois étapes. Vos données et votre paiement restent protégés.
            </p>
          </div>

          <div className="checkout-header-trust" aria-label="Garanties de commande">
            <span><Truck size={18} aria-hidden="true" /> Livraison suivie</span>
            <span><CreditCard size={18} aria-hidden="true" /> Paiement sécurisé</span>
            <span><Headphones size={18} aria-hidden="true" /> Équipe disponible</span>
          </div>
        </header>

        <div className="checkout-progress-shell">
          <CheckoutProgress currentStep={currentStep} t={t} />
        </div>

        <div className="checkout-layout">
          <section className="checkout-main" aria-labelledby="checkout-step-title">
            <div className="checkout-step-intro">
              <span>{stepCopy.eyebrow}</span>
              <div className="checkout-step-intro-row">
                <div>
                  <h2 id="checkout-step-title">{stepCopy.title}</h2>
                  <p>{stepCopy.description}</p>
                </div>
                <strong aria-hidden="true">0{stepNumber}</strong>
              </div>
            </div>

            <div className="checkout-wrapper">
              {step === "contact" && (
                <>
                  <BillingForm
                    t={t}
                    billingCustomer={billingCustomer}
                    setBillingCustomer={setBillingCustomer}
                  />

                  <button
                    type="button"
                    className={`checkout-pay checkout-pay-large ${
                      canContinueToShipping ? "checkout-pay-active" : ""
                    }`}
                    disabled={!canContinueToShipping}
                    onClick={() => setStep("shipping")}
                  >
                    <span className="checkout-pay-text">
                      <small className="checkout-pay-label">Étape suivante</small>
                      <strong className="checkout-pay-main">Continuer vers la livraison</strong>
                    </span>
                    <span className="checkout-pay-arrow" aria-hidden="true">→</span>
                  </button>
                </>
              )}

              {step === "shipping" && (
                <>
                  <ShippingAddressForm
                    t={t}
                    sameAsBilling={sameAsBilling}
                    setSameAsBilling={setSameAsBilling}
                    shippingCustomer={shippingCustomer}
                    setShippingCustomer={setShippingCustomer}
                  />

                  {shippingLoading ? (
                    <section className="checkout-section">
                      <p className="checkout-loading">{t.loadingShipping}</p>
                    </section>
                  ) : (
                    <section className="checkout-section">
                      <div className="checkout-section-top">
                        <div>
                          <span className="checkout-section-kicker">{t.shipping}</span>
                          <h2 className="checkout-subtitle">{t.chooseShippingMethod}</h2>
                        </div>
                        <div className={`checkout-selection-pill ${
                          hasShippingSelected ? "" : "checkout-selection-pill-muted"
                        }`}>
                          {hasShippingSelected ? t.selectedMethod : t.selectionRequired}
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

                  <div className="checkout-payment-bar">
                    <button type="button" className="checkout-back-button" onClick={() => setStep("contact")}>
                      <span aria-hidden="true">←</span> Retour
                    </button>
                    <button
                      type="button"
                      className={`checkout-pay checkout-pay-large ${
                        canContinueToPayment ? "checkout-pay-active" : ""
                      }`}
                      disabled={!canContinueToPayment}
                      onClick={() => setStep("payment")}
                    >
                      <span className="checkout-pay-text">
                        <small className="checkout-pay-label">Étape suivante</small>
                        <strong className="checkout-pay-main">Continuer vers le paiement</strong>
                      </span>
                      <span className="checkout-pay-arrow" aria-hidden="true">→</span>
                    </button>
                  </div>
                </>
              )}

              {step === "payment" && (
                <>
                  <section className="checkout-section">
                    <div className="checkout-section-top">
                      <div>
                        <span className="checkout-section-kicker">{t.payment}</span>
                        <h2 className="checkout-subtitle">{t.choosePaymentMethod}</h2>
                      </div>
                      <div className={`checkout-selection-pill ${
                        hasPaymentSelected ? "" : "checkout-selection-pill-muted"
                      }`}>
                        {hasPaymentSelected ? t.selectedPayment : t.selectionRequired}
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

                  {paymentMethod?.provider === "paypal" &&
                    (!paypalClientId ? (
                      <section className="checkout-section checkout-payment-error">
                        <p>{t.paypalUnavailable}</p>
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
                        paypalOrderDocIdRef={paypalOrderDocIdRef}
                        clearCart={clearCart}
                      />
                    ))}

                  <HeardFrom
                    t={t}
                    heardFrom={heardFrom}
                    setHeardFrom={setHeardFrom}
                    heardFromOther={heardFromOther}
                    setHeardFromOther={setHeardFromOther}
                  />

                  <OrderTotals
                    t={t}
                    cartHTCents={cartHTCents}
                    cartVatCents={cartVatCents}
                    shippingTTCCents={shippingTTCCents}
                    shippingVatRate={shippingVatRate}
                    finalTTCCents={finalTTCCents}
                  />

                  <div className="checkout-payment-bar">
                    <button type="button" className="checkout-back-button" onClick={() => setStep("shipping")}>
                      <span aria-hidden="true">←</span> Retour
                    </button>
                    {paymentMethod?.provider !== "paypal" && (
                      <button
                        type="button"
                        onClick={pay}
                        disabled={!hasPaymentSelected}
                        className={`checkout-pay checkout-pay-large ${
                          hasPaymentSelected ? "checkout-pay-active" : ""
                        }`}
                      >
                        <span className="checkout-pay-text">
                          <small className="checkout-pay-label">Paiement sécurisé</small>
                          <strong className="checkout-pay-main">{payButtonLabel}</strong>
                        </span>
                        <span className="checkout-pay-arrow" aria-hidden="true">→</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>

          <aside className="checkout-order-panel" aria-label="Récapitulatif de commande">
            <div className="checkout-order-sticky">
              <div className="checkout-order-heading">
                <span>Votre commande</span>
                <small>Modifiable avant le paiement</small>
              </div>
              <CartSummaryInline />
              <div className="checkout-order-reassurance">
                <ShieldCheck size={18} aria-hidden="true" />
                <p><strong>Achat protégé</strong><span>Connexion sécurisée et données chiffrées.</span></p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
