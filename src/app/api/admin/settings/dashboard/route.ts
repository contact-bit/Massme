import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase.admin";

const DOC_PATH = "settings/dashboard";

const SIZES = new Set(["small", "medium", "large"]);
const TONES = new Set([
  "neutral",
  "primary",
  "success",
  "warning",
  "danger",
  "highlight",
]);

function normalizeWidgets(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item: any) => {
      const id =
        typeof item?.id === "string"
          ? item.id
          : "";

      if (!id) {
        return null;
      }

      const size = SIZES.has(item?.size)
        ? item.size
        : "small";

      const tone = TONES.has(item?.tone)
        ? item.tone
        : "neutral";

      return {
        id,
        size,
        tone,
        visible:
          item?.visible === false
            ? false
            : true,
      };
    })
    .filter(Boolean);
}

export async function GET() {
  try {
    const db = getAdminDb();
    const snap = await db.doc(DOC_PATH).get();
    const data = snap.exists ? snap.data() : null;

    return NextResponse.json({
      ok: true,
      widgets: normalizeWidgets(data?.widgets),
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        message: e?.message || String(e),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const db = getAdminDb();
    const body = await req.json().catch(() => ({}));
    const widgets = normalizeWidgets(body?.widgets);

    await db.doc(DOC_PATH).set(
      {
        widgets,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({
      ok: true,
      widgets,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        message: e?.message || String(e),
      },
      { status: 500 }
    );
  }
}
