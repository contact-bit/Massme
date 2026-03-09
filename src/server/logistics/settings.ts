import { dbAdmin } from "@/lib/firebase.admin";

export type LogisticsProvider = "internal" | "shipstation";

export async function getLogisticsSettings() {
  const snap = await dbAdmin.collection("settings").doc("logistics").get();
  const data = snap.exists ? (snap.data() as any) : null;

  const provider: LogisticsProvider =
    data?.provider === "shipstation" ? "shipstation" : "internal";

  return {
    provider,
    raw: data,
  };
}

export async function isShipStationEnabled() {
  const { provider } = await getLogisticsSettings();
  return provider === "shipstation";
}