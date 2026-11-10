import type { NextRequest } from "next/server";
import { env } from "@/infrastructure/config/env";
import { updateSession } from "@/infrastructure/supabase/session";
import { contentSecurityPolicy } from "@/lib/content-security-policy";

// Signed-in users are sent from these pages to /home.
const authPages = ["/sign-in", "/sign-up", "/forgot-password"];
// Reachable whether signed in or not. Every other route needs a signed-in user.
const publicRoutes = ["/auth/callback", "/offline"];

export async function proxy(request: NextRequest) {
  // A fresh nonce for every page (Next.js CSP guide). Next.js reads it from the request's policy
  // and adds it to its own scripts; the root layout reads x-nonce for the theme script.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const policy = contentSecurityPolicy({
    nonce,
    supabaseUrl: env.supabaseUrl,
    isDev: process.env.NODE_ENV === "development",
  });
  request.headers.set("x-nonce", nonce);
  request.headers.set("Content-Security-Policy", policy);

  const session = await updateSession(request);
  const { pathname } = request.nextUrl;
  const page = () => {
    session.response.headers.set("Content-Security-Policy", policy);
    return session.response;
  };
  if (publicRoutes.includes(pathname)) return page();

  const onAuthPage = authPages.includes(pathname);
  if (!session.signedIn && !onAuthPage) return session.redirect("/sign-in");
  if (session.signedIn && onAuthPage) return session.redirect("/home");
  return page();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|manifest\\.webmanifest|sw\\.js|.*\\.(?:png|svg|ico|jpg|jpeg|gif|webp)$).*)",
  ],
};
