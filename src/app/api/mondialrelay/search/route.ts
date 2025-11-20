import { NextResponse } from "next/server";
import crypto from "crypto";
import xml2js from "xml2js";

const MERCHANT = {
  Enseigne: "CC23PDX2",
  PrivateKey: "GP8KVrZi",
};

function generateSecurity(params: Record<string, string>) {
  const values = Object.values(params).join("") + MERCHANT.PrivateKey;
  return crypto.createHash("md5").update(values).digest("hex").toUpperCase();
}

export async function POST(req: Request) {
  try {
    const { cp, city, country = "FR" } = await req.json();

    const params = {
      Enseigne: MERCHANT.Enseigne,
      Pays: country,
      Ville: city || "",
      CP: cp,
      NbResult: "20",
    };

    const Security = generateSecurity(params);

    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns:mond="http://mondialrelay.fr/WebService/">
        <soapenv:Body>
          <mond:WSI4_PointRelais_Recherche>
            <mond:Enseigne>${params.Enseigne}</mond:Enseigne>
            <mond:Pays>${params.Pays}</mond:Pays>
            <mond:Ville>${params.Ville}</mond:Ville>
            <mond:CP>${params.CP}</mond:CP>
            <mond:NbResult>${params.NbResult}</mond:NbResult>
            <mond:Security>${Security}</mond:Security>
          </mond:WSI4_PointRelais_Recherche>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const response = await fetch("https://api.mondialrelay.com/WebService.asmx", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "http://mondialrelay.fr/WebService/WSI4_PointRelais_Recherche",
      },
      body: soapBody,
    });

    const xml = await response.text();

    // 🟦 Parse XML → JSON
    const parsed = await xml2js.parseStringPromise(xml, { explicitArray: false });

    const results =
      parsed?.Envelope?.Body?.WSI4_PointRelais_RechercheResponse
        ?.WSI4_PointRelais_RechercheResult?.PointsRelais?.PointRelais_Details || [];

    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
