import { NextResponse } from "next/server";
import crypto from "crypto";
import xml2js from "xml2js";

const ENDPOINT = "https://api.mondialrelay.com/WebService.asmx";
const BRAND = "CC23PDX2";
const PRIVATE_KEY = "GP8KVrZi";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cp = searchParams.get("cp") || "13008"; // Code postal par défaut (test)

  /* -------------------------------------------------------
     🔐 Calcul sécurité MD5 : BRAND + Pays + CP + PrivateKey
  ------------------------------------------------------- */
  const security = crypto
    .createHash("md5")
    .update(BRAND + "FR" + cp + PRIVATE_KEY)
    .digest("hex")
    .toUpperCase();

  /* -------------------------------------------------------
     📡 SOAP BODY
  ------------------------------------------------------- */
  const xml = `
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
        xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <WSI4_PointRelais_Recherche xmlns="http://www.mondialrelay.fr/webservice/">
          <Enseigne>${BRAND}</Enseigne>
          <Pays>FR</Pays>
          <CP>${cp}</CP>
          <NbResults>10</NbResults>
          <Security>${security}</Security>
        </WSI4_PointRelais_Recherche>
      </soap:Body>
    </soap:Envelope>
  `;

  try {
    /* -------------------------------------------------------
       📬 Appel API Mondial Relay
    ------------------------------------------------------- */
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml;charset=utf-8",
        SOAPAction:
          "http://www.mondialrelay.fr/webservice/WSI4_PointRelais_Recherche",
      },
      body: xml,
    });

    const text = await response.text();

    console.log("🔵 SOAP RAW RESPONSE:");
    console.log(text);

    /* -------------------------------------------------------
       📦 Parse XML -> JS (xml2js)
    ------------------------------------------------------- */
    const parsed = await xml2js.parseStringPromise(text, {
      explicitArray: false,
    });

    const list =
      parsed?.Envelope?.Body?.WSI4_PointRelais_RechercheResponse
        ?.WSI4_PointRelais_RechercheResult?.PointsRelais
        ?.PointRelais_Details || [];

    /* -------------------------------------------------------
       🟢 Réponse OK
    ------------------------------------------------------- */
    return NextResponse.json({ ok: true, list });

  } catch (e: any) {
    /* -------------------------------------------------------
       🔥 Correction TS : e = unknown → on normalise
    ------------------------------------------------------- */
    return NextResponse.json({
      ok: false,
      error: typeof e === "string" ? e : e?.message || "Unknown error",
    });
  }
}
