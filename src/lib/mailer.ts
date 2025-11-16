import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type Order = {
  id: string;
  amount_total: number;
  currency: string;
  customer_email: string;
  payment_status: string;
  created_at: any; // Firestore timestamp possible
};

export async function sendOrderEmails({
  order,
  clientEmail,
}: {
  order: Order;
  clientEmail: string;
}) {
  console.log("🔑 Resend key loaded:", !!process.env.RESEND_API_KEY);

  // Sender sécurisé tant que domaine non validé
  const sender = "Massme <onboarding@resend.dev>";

  const created =
    order.created_at?._seconds
      ? new Date(order.created_at._seconds * 1000)
      : new Date(order.created_at || Date.now());

  const subjectClient = "🧘 Votre commande Massme est confirmée";
  const subjectAdmin = "🛍️ Nouvelle commande reçue";
  const subjectLogistics = "📦 Commande à préparer";

  const textClient = `
Bonjour,

Merci pour votre commande chez Massme 💆‍♀️
Votre paiement de ${order.amount_total / 100} ${order.currency.toUpperCase()} a bien été reçu.

Nous vous informerons dès que votre commande sera en préparation.

À bientôt,
L’équipe Massme
  `;

  const textAdmin = `
Nouvelle commande reçue !

- ID: ${order.id}
- Email client: ${order.customer_email}
- Montant: ${order.amount_total / 100} ${order.currency.toUpperCase()}
- Statut: ${order.payment_status}
  `;

  const textLogistics = `
Une nouvelle commande doit être traitée :

Client : ${order.customer_email}
Montant : ${order.amount_total / 100} ${order.currency.toUpperCase()}
Date : ${created.toLocaleString("fr-FR")}
  `;

  try {
    console.log("📮 Envoi des e-mails...");

    const logisticsEmails = process.env.LOGISTICS_EMAILS
      ? process.env.LOGISTICS_EMAILS.split(",").map((e) => e.trim())
      : [];

    const results = await Promise.allSettled([
      resend.emails.send({
        from: sender,
        to: clientEmail,
        subject: subjectClient,
        text: textClient,
      }),
      resend.emails.send({
        from: sender,
        to: process.env.ADMIN_EMAIL!,
        subject: subjectAdmin,
        text: textAdmin,
      }),
      ...logisticsEmails.map((logEmail) =>
        resend.emails.send({
          from: sender,
          to: logEmail,
          subject: subjectLogistics,
          text: textLogistics,
        })
      ),
    ]);

    results.forEach((res, i) => {
      const type =
        i === 0
          ? "Client"
          : i === 1
          ? "Admin"
          : `Logistique ${i - 1}`;
      if (res.status === "fulfilled") {
        console.log(`✅ Email ${type} envoyé`);
      } else {
        console.error(`❌ Échec ${type}:`, res.reason);
      }
    });

    console.log("✅ Envoi terminé");
  } catch (err) {
    console.error("💥 Erreur critique Resend :", err);
  }
}
