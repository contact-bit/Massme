import "server-only";
import { dbAdmin } from "@/lib/firebase.admin"; // <-- adapte à TON chemin existant
import type { FulfillmentStatus, FulfillmentTracking, FulfillmentShipStation } from "@/types/fulfillment";

export async function setFulfillmentStatus(orderId: string, status: FulfillmentStatus) {
  await dbAdmin.collection("orders").doc(orderId).set(
    {
      fulfillment: {
        status,
        updatedAt: new Date().toISOString(),
      },
    },
    { merge: true }
  );
}

export async function setShipStationLink(orderId: string, shipstation: FulfillmentShipStation) {
  await dbAdmin.collection("orders").doc(orderId).set(
    {
      fulfillment: {
        shipstation,
        updatedAt: new Date().toISOString(),
      },
    },
    { merge: true }
  );
}

export async function setTracking(orderId: string, tracking: FulfillmentTracking) {
  await dbAdmin.collection("orders").doc(orderId).set(
    {
      fulfillment: {
        tracking,
        updatedAt: new Date().toISOString(),
      },
    },
    { merge: true }
  );
}
