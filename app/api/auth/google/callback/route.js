import { NextResponse } from "next/server";
import {
  createSessionToken,
  getAllowedGoogleEmails,
  getBaseUrl,
  googleStateCookieName,
  sessionCookieName,
  sessionCookieOptions,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = request.cookies.get(googleStateCookieName)?.value;
  const baseUrl = getBaseUrl(request);

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL("/login?error=google_state", baseUrl));
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: `${baseUrl}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL("/login?error=google_token", baseUrl));
  }

  const tokens = await tokenResponse.json();
  const profileResponse = await fetch(
    `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${tokens.id_token}`
  );

  if (!profileResponse.ok) {
    return NextResponse.redirect(new URL("/login?error=google_profile", baseUrl));
  }

  const profile = await profileResponse.json();
  const email = String(profile.email || "").toLowerCase();
  const allowedEmails = getAllowedGoogleEmails();

  if (!email || allowedEmails.length === 0 || !allowedEmails.includes(email)) {
    return NextResponse.redirect(new URL("/login?error=google_denied", baseUrl));
  }

  const response = NextResponse.redirect(new URL("/", baseUrl));
  response.cookies.set(
    sessionCookieName,
    await createSessionToken({
      email,
      name: profile.name,
      provider: "google",
    }),
    sessionCookieOptions()
  );
  response.cookies.set(googleStateCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
