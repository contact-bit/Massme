export const ADMIN_SESSION_COOKIE = "hd_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

export type AdminSessionRole = "admin" | "logistics";

export type AdminSession = {
  role: AdminSessionRole;
  issuedAt: number;
  expiresAt: number;
};

type SessionPayload = {
  version: 1;
  role: AdminSessionRole;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
};

const encoder = new TextEncoder();

function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    [
      process.env.ADMIN_PASSWORD || "",
      process.env.LOGISTICS_PASSWORD || "",
    ].join(":")
  );
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");

  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function encodePayload(payload: SessionPayload) {
  return toBase64Url(encoder.encode(JSON.stringify(payload)));
}

function decodePayload(value: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(
      new TextDecoder().decode(fromBase64Url(value))
    ) as Partial<SessionPayload>;

    if (
      parsed.version !== 1 ||
      (parsed.role !== "admin" && parsed.role !== "logistics") ||
      typeof parsed.issuedAt !== "number" ||
      typeof parsed.expiresAt !== "number" ||
      typeof parsed.nonce !== "string"
    ) {
      return null;
    }

    return parsed as SessionPayload;
  } catch {
    return null;
  }
}

async function getSigningKey() {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET ou ADMIN_PASSWORD doit être configuré."
    );
  }

  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createAdminSessionToken(
  role: AdminSessionRole
) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = encodePayload({
    version: 1,
    role,
    issuedAt,
    expiresAt: issuedAt + ADMIN_SESSION_MAX_AGE,
    nonce: crypto.randomUUID(),
  });

  const key = await getSigningKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyAdminSessionToken(
  token: string | null | undefined
): Promise<AdminSession | null> {
  if (!token) return null;

  const [payloadPart, signaturePart, extra] = token.split(".");

  if (!payloadPart || !signaturePart || extra) return null;

  try {
    const key = await getSigningKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signaturePart),
      encoder.encode(payloadPart)
    );

    if (!valid) return null;

    const payload = decodePayload(payloadPart);
    const now = Math.floor(Date.now() / 1000);

    if (!payload || payload.expiresAt <= now || payload.issuedAt > now + 60) {
      return null;
    }

    return {
      role: payload.role,
      issuedAt: payload.issuedAt,
      expiresAt: payload.expiresAt,
    };
  } catch {
    return null;
  }
}

export function readSessionCookie(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";

  for (const entry of cookieHeader.split(";")) {
    const separator = entry.indexOf("=");

    if (separator < 0) continue;

    const name = entry.slice(0, separator).trim();

    if (name === ADMIN_SESSION_COOKIE) {
      return decodeURIComponent(entry.slice(separator + 1).trim());
    }
  }

  return null;
}

export async function getAdminSessionFromRequest(req: Request) {
  return verifyAdminSessionToken(readSessionCookie(req));
}
