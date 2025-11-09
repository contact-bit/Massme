import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  try {
    const data = await resend.emails.send({
      from: "Massme <onboarding@resend.dev>",
      to: ["devhdconnects@gmail.com", "dazz.services@gmail.com"],
      subject: "Test Massme multi",
      text: "Test d'envoi à plusieurs adresses ✅",
    });

    console.log("✅ Email envoyé :", data);
  } catch (err) {
    console.error("❌ Erreur :", err);
  }
}

main();
