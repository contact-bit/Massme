import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type Order = {
  id: string;
  amount_total: number;
  currency: string;
  customer_email: string;
  payment_status: string;
  created_at: string;
};

// Fonction d'envoi d'e-mails de commande
export async function sendOrderEmails({
  order,
  clientEmail,
}: {
  order: Order;
  clientEmail: string;
}) {
  console.log("🔑 Resend key loaded:", !!process.env.RESEND_API_KEY);
  console.log("📦 Admin email:", process.env.ADMIN_EMAIL);
  console.log("🚚 Logistics emails:", process.env.LOGISTICS_EMAILS);

  const subjectClient = "🧘 Votre commande Massme est confirmée";
  const subjectAdmin = "🛍️ Nouvelle commande reçue";
  const subjectLogistics = "📦 Commande à préparer";

  const textClient = `
Bonjour,

Merci pour votre commande chez Massme 💆‍♀️
Votre paiement de ${order.amount_total} ${order.currency.toUpperCase()} a bien été reçu.

Nous vous informerons dès que votre commande sera en préparation.

À bientôt,
L’équipe Massme
  `;

  const textAdmin = `
Nouvelle commande reçue !

- ID: ${order.id}
- Email client: ${order.customer_email}
- Montant: ${order.amount_total} ${order.currency.toUpperCase()}
- Statut: ${order.payment_status}
  `;

  const textLogistics = `
Une nouvelle commande doit être traitée :

Client : ${order.customer_email}
Montant : ${order.amount_total} ${order.currency.toUpperCase()}
Date : ${new Date(order.created_at).toLocaleString("fr-FR")}
  `;

  try {
    console.log("📧 Envoi des e-mails Massme...");

    // Adresse expéditeur (utilise onboarding@resend.dev tant que massme.fr n’est pas validé)
    const sender = "Massme <contact@hdconnects.com>";

    // Liste des destinataires logistiques (peut contenir plusieurs adresses séparées par une virgule)
    const logisticsEmails = process.env.LOGISTICS_EMAILS
      ? process.env.LOGISTICS_EMAILS.split(",").map((e) => e.trim())
      : [];

    // Supprime les doublons (si le mail du client ou admin est déjà dans logistique)
    const uniqueRecipients = Array.from(
      new Set([clientEmail, process.env.ADMIN_EMAIL!, ...logisticsEmails])
    );

    console.log("📮 Envoi vers :", uniqueRecipients);

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
        const id = res.value?.data?.id ?? "(aucun ID)";
        console.log(`✅ Email ${type} envoyé (ID: ${id})`);
      } else {
        console.error(`❌ Échec envoi ${type}:`, res.reason);
      }
    });

    console.log("✅ Envoi terminé.");
  } catch (err) {
    console.error("💥 Erreur critique d’envoi Resend :", err);
  }
}
