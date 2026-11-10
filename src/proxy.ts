import type { NextRequest } from "next/server";
import { updateSession } from "@/infrastructure/supabase/session";

// Signed-in users are sent from these pages to /home.
const authPages = ["/sign-in", "/sign-up", "/forgot-password"];
// Reachable whether signed in or not. Every other route needs a signed-in user.
const publicRoutes = ["/auth/callback", "/offline"];

export async function proxy(request: NextRequest) {
  const session = await updateSession(request);
  const { pathname } = request.nextUrl;
  if (publicRoutes.includes(pathname)) return session.response;

  const onAuthPage = authPages.includes(pathname);
  if (!session.signedIn && !onAuthPage) return session.redirect("/sign-in");
  if (session.signedIn && onAuthPage) return session.redirect("/home");
  return session.response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|manifest\\.webmanifest|sw\\.js|.*\\.(?:png|svg|ico|jpg|jpeg|gif|webp)$).*)",
  ],
};
