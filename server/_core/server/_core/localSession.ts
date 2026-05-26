import crypto from "node:crypto";

const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function getSecret() {
  const secret =
    process.env.LOCAL_AUTH_SECRET ||
    process.env.JWT_SECRET ||
    process.env.SESSION_SECRET ||
    "clinica-da-alma-dev-session-secret-change-in-production";

  return secret;
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export type LocalSessionPayload = {
  openId: string;
  exp: number;
};

export function createLocalSessionToken(openId: string, ttlSeconds = DEFAULT_SESSION_TTL_SECONDS) {
  const payload: LocalSessionPayload = {
    openId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyLocalSessionToken(token?: string | null): LocalSessionPayload | null {
  if (!token || typeof token !== "string") return null;

  const [encodedPayload, receivedSignature] = token.split(".");
  if (!encodedPayload || !receivedSignature) return null;

  const expectedSignature = signPayload(encodedPayload);
  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);

  if (received.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(received, expected)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as LocalSessionPayload;
    if (!payload.openId || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getConfiguredLocalCredentials() {
  return {
    openId: process.env.LOCAL_AUTH_OPEN_ID || "clinica-da-alma-local-owner",
    name:
      process.env.LOCAL_AUTH_NAME ||
      process.env.OWNER_NAME ||
      "Clínica da Alma",
    email: process.env.LOCAL_AUTH_EMAIL || process.env.ADMIN_EMAIL || null,
    password:
      process.env.LOCAL_AUTH_PASSWORD ||
      process.env.ADMIN_PASSWORD ||
      "clinica-da-alma-2026",
  };
}

export function validateLocalPassword(password: string) {
  const expected = getConfiguredLocalCredentials().password;
  const receivedBuffer = Buffer.from(password);
  const expectedBuffer = Buffer.from(expected);

  if (receivedBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}
