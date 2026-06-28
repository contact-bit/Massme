import "server-only";

import {
  initializeApp,
  cert,
  getApps,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ✅ Chargement sécurisé depuis les variables d’environnement
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// 🧩 Vérification minimale pour éviter les erreurs silencieuses
if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
  console.error("❌ Erreur : Variables Firebase Admin manquantes !");
  console.error({
    projectId: !!serviceAccount.projectId,
    privateKey: !!serviceAccount.privateKey,
    clientEmail: !!serviceAccount.clientEmail,
  });
  throw new Error("Firebase Admin n’a pas pu être initialisé — vérifie ton .env.local");
}

// 🚀 Initialisation unique de Firebase Admin
const app =
  !getApps().length
    ? initializeApp({ credential: cert(serviceAccount as ServiceAccount) })
    : getApps()[0];

// ✅ Export Firestore Admin
export const dbAdmin = getFirestore(app);

/** @deprecated Utiliser directement `dbAdmin` dans les nouveaux fichiers. */
export function getAdminDb() {
  return dbAdmin;
}
