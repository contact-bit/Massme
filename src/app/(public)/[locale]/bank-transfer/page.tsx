// src/app/(public)/[locale]/bank-transfer/page.tsx
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const BANK_DETAILS = {
  beneficiary: "MASSME SAS", // ✅ remplace
  iban: "FR76 XXXX XXXX XXXX XXXX XXXX XXX", // ✅ remplace
  bic: "XXXXXXXXXXX", // ✅ remplace
  bankName: "Votre banque", // ✅ optionnel
};

function t(locale: Locale) {
  const base = {
    title: "Virement bancaire",
    subtitle: "Instructions de paiement",
    orderRef: "Référence commande",
    amount: "Montant à payer",
    beneficiary: "Bénéficiaire",
    iban: "IBAN",
    bic: "BIC / SWIFT",
    importantTitle: "Important",
    importantText:
      "Merci d’indiquer la référence dans le libellé du virement. Sans ça, on peut avoir du mal à retrouver votre paiement.",
    afterPaymentTitle: "Après le virement",
    afterPaymentText:
      "Dès réception du paiement, votre commande passera en préparation. Cela peut prendre 1 à 2 jours ouvrés selon votre banque.",
    backHome: "Retour à l’accueil",
    help: "Besoin d’aide ? Contactez-nous.",
    copy: "Copier",
    copied: "Copié !",
    missingOrder: "Paramètre order_id manquant dans l’URL.",
  };

  if (locale === "en") {
    return {
      ...base,
      title: "Bank transfer",
      subtitle: "Payment instructions",
      orderRef: "Order reference",
      amount: "Amount to pay",
      beneficiary: "Beneficiary",
      importantTitle: "Important",
      importantText:
        "Please include the reference in your bank transfer description. Without it, we may have trouble matching your payment.",
      afterPaymentTitle: "After the transfer",
      afterPaymentText:
        "As soon as we receive the payment, your order will move to processing. This can take 1–2 business days depending on your bank.",
      backHome: "Back to home",
      help: "Need help? Contact us.",
      missingOrder: "Missing order_id parameter in the URL.",
    };
  }

  // autres locales = FR (fallback)
  return base;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default async function BankTransferPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order_id?: string; amount?: string; reference?: string }>;
}) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    // si tu as notFound() dispo, tu peux l’utiliser. Ici on garde simple.
    return null;
  }

  const locale = rawLocale as Locale;
  const tr = t(locale);

  const sp = await searchParams;
  const orderId = sp.order_id ?? "";
  const reference = sp.reference ?? orderId; // si tu veux passer une vraie ref via URL plus tard
  const amount = sp.amount ?? ""; // optionnel si tu le passes un jour

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "24px 16px 64px",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>{tr.title}</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>{tr.subtitle}</p>

      {!orderId ? (
        <div
          style={{
            marginTop: 18,
            padding: 16,
            border: "1px solid rgba(0,0,0,.12)",
            borderRadius: 12,
          }}
        >
          <strong>{tr.missingOrder}</strong>
        </div>
      ) : (
        <>
          {/* Card */}
          <section
            style={{
              marginTop: 18,
              padding: 18,
              border: "1px solid rgba(0,0,0,.12)",
              borderRadius: 12,
            }}
          >
            <Row
              label={tr.orderRef}
              value={reference}
              copyValue={reference}
              locale={locale}
            />

            {amount ? (
              <Row label={tr.amount} value={`${amount} €`} locale={locale} />
            ) : null}

            <Divider />

            <Row
              label={tr.beneficiary}
              value={BANK_DETAILS.beneficiary}
              copyValue={BANK_DETAILS.beneficiary}
              locale={locale}
            />

            <Row
              label={tr.iban}
              value={BANK_DETAILS.iban}
              copyValue={BANK_DETAILS.iban}
              locale={locale}
            />

            <Row
              label={tr.bic}
              value={BANK_DETAILS.bic}
              copyValue={BANK_DETAILS.bic}
              locale={locale}
            />

            {BANK_DETAILS.bankName ? (
              <Row label="Banque" value={BANK_DETAILS.bankName} locale={locale} />
            ) : null}
          </section>

          {/* Important */}
          <section
            style={{
              marginTop: 14,
              padding: 16,
              borderRadius: 12,
              background: "rgba(0,0,0,.04)",
            }}
          >
            <strong>{tr.importantTitle}</strong>
            <p style={{ margin: "8px 0 0", opacity: 0.85 }}>{tr.importantText}</p>
          </section>

          {/* After payment */}
          <section style={{ marginTop: 14 }}>
            <strong>{tr.afterPaymentTitle}</strong>
            <p style={{ margin: "8px 0 0", opacity: 0.85 }}>{tr.afterPaymentText}</p>
            <p style={{ margin: "10px 0 0", opacity: 0.85 }}>{tr.help}</p>
          </section>
        </>
      )}

      <div style={{ marginTop: 22 }}>
        <Link
          href={`/${locale}`}
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,.14)",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          {tr.backHome}
        </Link>
      </div>
    </main>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "rgba(0,0,0,.12)", margin: "14px 0" }} />;
}

function Row({
  label,
  value,
  copyValue,
  locale,
}: {
  label: string;
  value: string;
  copyValue?: string;
  locale: Locale;
}) {
  // composant server => pas d'état; on fait un bouton copy seulement si client
  // Solution simple: data-copy + un petit script inline
  const id = `${label}-${Math.random().toString(16).slice(2)}`.replace(/\s+/g, "-");

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
      <div style={{ width: 150, opacity: 0.7, fontSize: 13 }}>{label}</div>

      <div style={{ flex: 1, fontWeight: 600, overflowWrap: "anywhere" }} id={id}>
        {value}
      </div>

      {copyValue ? (
        <>
          <button
            type="button"
            data-copy-target={id}
            data-copy-value={copyValue}
            style={{
              border: "1px solid rgba(0,0,0,.14)",
              background: "transparent",
              borderRadius: 10,
              padding: "8px 10px",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {locale === "en" ? "Copy" : "Copier"}
          </button>

          {/* petit script inline pour copier (sans créer un composant client séparé) */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(){
                  const btns = document.querySelectorAll('button[data-copy-target="${id}"]');
                  btns.forEach((btn)=>{
                    btn.addEventListener('click', async ()=>{
                      try{
                        const val = btn.getAttribute('data-copy-value') || '';
                        await navigator.clipboard.writeText(val);
                        const original = btn.textContent;
                        btn.textContent = '${locale === "en" ? "Copied!" : "Copié !"}';
                        setTimeout(()=>{ btn.textContent = original; }, 900);
                      }catch(e){}
                    });
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
