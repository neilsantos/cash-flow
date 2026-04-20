export const sessionCookieName = "cash_flow_session";
export const googleStateCookieName = "cash_flow_google_state";

const encoder = new TextEncoder();

function getSecret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "cash-flow-dev-secret";
}

function base64UrlEncode(value) {
  const bytes = value instanceof Uint8Array ? value : encoder.encode(value);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(
    Math.ceil(value.length / 4) * 4,
    "="
  );
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmac(value) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

function safeEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

export async function createSessionToken(user) {
  const payload = base64UrlEncode(
    JSON.stringify({
      email: user.email,
      name: user.name || user.email,
      provider: user.provider || "credentials",
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    })
  );

  return `${payload}.${await hmac(payload)}`;
}

export async function readSessionToken(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [payload, signature] = token.split(".");
  const expectedSignature = await hmac(payload);

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const session = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
    if (!session.exp || session.exp < Date.now()) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function getAllowedGoogleEmails() {
  const configured = process.env.AUTH_GOOGLE_ALLOWED_EMAILS || process.env.AUTH_EMAIL || "";
  return configured
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getBaseUrl(request) {
  return process.env.APP_URL || new URL(request.url).origin;
}
