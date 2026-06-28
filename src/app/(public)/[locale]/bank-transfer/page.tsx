// src/app/(public)/[locale]/bank-transfer/page.tsx

import "./bank-transfer.css";

import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const BANK_DETAILS = {
  beneficiary: "LAZURCO SASU",
  iban: "FR76 XXXX XXXX XXXX XXXX XXXX XXX",
  bic: "XXXXXXXXXXX",
  bankName: "Votre banque",
};

function t(locale: Locale) {
  const base = {
    title: "Virement bancaire",

    subtitle:
      "Finalisez votre commande grâce aux informations de paiement ci-dessous.",

    orderRef: "Référence commande",

    amount: "Montant à payer",

    beneficiary: "Bénéficiaire",

    iban: "IBAN",

    bic: "BIC / SWIFT",

    importantTitle: "Information importante",

    importantText:
      "Merci d’indiquer votre référence de commande dans le libellé du virement afin que nous puissions identifier rapidement votre paiement.",

    afterPaymentTitle:
      "Après réception du paiement",

    afterPaymentText:
      "Votre commande sera automatiquement validée dès confirmation bancaire. Le délai peut varier entre 1 et 2 jours ouvrés selon votre établissement bancaire.",

    backHome: "Retour à l’accueil",

    help:
      "Une question concernant votre paiement ? Notre équipe reste disponible.",

    copy: "Copier",

    copied: "Copié !",

    missingOrder:
      "Le paramètre order_id est manquant dans l’URL.",
  };

  if (locale === "en") {
    return {
      ...base,

      title: "Bank transfer",

      subtitle:
        "Complete your order using the payment information below.",

      orderRef: "Order reference",

      amount: "Amount to pay",

      beneficiary: "Beneficiary",

      importantTitle:
        "Important information",

      importantText:
        "Please include your order reference in the transfer description so we can quickly identify your payment.",

      afterPaymentTitle:
        "After payment",

      afterPaymentText:
        "Your order will be automatically validated once the payment is received. Processing may take 1–2 business days depending on your bank.",

      backHome: "Back to home",

      help:
        "Need help with your payment? Our team remains available.",

      copy: "Copy",

      copied: "Copied!",

      missingOrder:
        "Missing order_id parameter in the URL.",
    };
  }

  return base;
}

export default async function BankTransferPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;

  searchParams: Promise<{
    order_id?: string;
    amount?: string;
    reference?: string;
  }>;
}) {
  const { locale: rawLocale } =
    await params;

  if (!isLocale(rawLocale)) {
    return null;
  }

  const locale =
    rawLocale as Locale;

  const tr = t(locale);

  const sp =
    await searchParams;

  const orderId =
    sp.order_id ?? "";

  const reference =
    sp.reference ?? orderId;

  const amount =
    sp.amount ?? "";

  return (
    <main className="home bank-transfer-page">
      <section className="section bank-transfer-section">
        <div className="container container-sm">
          <div className="bank-transfer-wrapper">
            {/* =========================================
                HEADER
            ========================================= */}

            <div className="bank-transfer-header">
              <div className="bank-transfer-badge">
                Paiement sécurisé
              </div>

              <h1 className="bank-transfer-title">
                {tr.title}
              </h1>

              <p className="bank-transfer-subtitle">
                {tr.subtitle}
              </p>
            </div>

            {!orderId ? (
              <div className="bank-alert">
                <strong>
                  {tr.missingOrder}
                </strong>
              </div>
            ) : (
              <>
                {/* =========================================
                    PAYMENT CARD
                ========================================= */}

                <div className="bank-transfer-card">
                  <Row
                    label={tr.orderRef}
                    value={reference}
                    copyValue={reference}
                    copyText={tr.copy}
                    copiedText={tr.copied}
                  />

                  {amount ? (
                    <Row
                      label={tr.amount}
                      value={`${amount} €`}
                      copyText={tr.copy}
                      copiedText={tr.copied}
                    />
                  ) : null}

                  <Divider />

                  <Row
                    label={tr.beneficiary}
                    value={
                      BANK_DETAILS.beneficiary
                    }
                    copyValue={
                      BANK_DETAILS.beneficiary
                    }
                    copyText={tr.copy}
                    copiedText={tr.copied}
                  />

                  <Row
                    label={tr.iban}
                    value={BANK_DETAILS.iban}
                    copyValue={
                      BANK_DETAILS.iban
                    }
                    copyText={tr.copy}
                    copiedText={tr.copied}
                  />

                  <Row
                    label={tr.bic}
                    value={BANK_DETAILS.bic}
                    copyValue={
                      BANK_DETAILS.bic
                    }
                    copyText={tr.copy}
                    copiedText={tr.copied}
                  />

                  {BANK_DETAILS.bankName ? (
                    <Row
                      label="Banque"
                      value={
                        BANK_DETAILS.bankName
                      }
                      copyText={tr.copy}
                      copiedText={tr.copied}
                    />
                  ) : null}
                </div>

                {/* =========================================
                    IMPORTANT
                ========================================= */}

                <div className="bank-transfer-info bank-transfer-info-primary">
                  <h2 className="bank-transfer-info-title">
                    {tr.importantTitle}
                  </h2>

                  <p className="bank-transfer-info-text">
                    {tr.importantText}
                  </p>
                </div>

                {/* =========================================
                    AFTER PAYMENT
                ========================================= */}

                <div className="bank-transfer-info">
                  <h2 className="bank-transfer-info-title">
                    {tr.afterPaymentTitle}
                  </h2>

                  <p className="bank-transfer-info-text">
                    {tr.afterPaymentText}
                  </p>

                  <p className="bank-transfer-help">
                    {tr.help}
                  </p>
                </div>
              </>
            )}

            {/* =========================================
                FOOTER ACTION
            ========================================= */}

            <div className="bank-transfer-actions">
              <Link
                href={`/${locale}`}
                className="
                  btn
                  btn-primary
                  btn-lg
                "
              >
                {tr.backHome}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   DIVIDER
========================================================= */

function Divider() {
  return (
    <div className="bank-divider" />
  );
}

/* =========================================================
   ROW
========================================================= */

function Row({
  label,
  value,
  copyValue,
  copyText,
  copiedText,
}: {
  label: string;

  value: string;

  copyValue?: string;

  copyText: string;

  copiedText: string;
}) {
  const id = `bank-${label}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <div className="bank-row">
      <div className="bank-row-label">
        {label}
      </div>

      <div
        id={id}
        className="bank-row-value"
      >
        {value}
      </div>

      {copyValue ? (
        <>
          <button
            type="button"
            data-copy-target={id}
            data-copy-value={copyValue}
            className="
              bank-copy-btn
              btn
              btn-outline
            "
          >
            {copyText}
          </button>

          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(){
                  const btns =
                    document.querySelectorAll(
                      'button[data-copy-target="${id}"]'
                    );

                  btns.forEach((btn)=>{
                    btn.addEventListener(
                      'click',
                      async ()=>{
                        try{
                          const val =
                            btn.getAttribute(
                              'data-copy-value'
                            ) || '';

                          await navigator.clipboard.writeText(val);

                          const original =
                            btn.textContent;

                          btn.textContent =
                            '${copiedText}';

                          setTimeout(()=>{
                            btn.textContent =
                              original;
                          }, 1200);

                        }catch(e){}
                      }
                    );
                  });
                })();
              `,
            }}
          />
        </>
      ) : null}
    </div>
  );
}
