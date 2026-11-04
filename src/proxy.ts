import type { NextRequest } from "next/server";
import { updateSession } from "@/infrastructure/supabase/session";

// Every other route needs a signed-in user.
const authPages = ["/sign-in", "/sign-up"];

export async function proxy(request: NextRequest) {
  const session = await updateSession(request);
  const onAuthPage = authPages.includes(request.nextUrl.pathname);

  if (!session.signedIn && !onAuthPage) return session.redirect("/sign-in");
  if (session.signedIn && onAuthPage) return session.redirect("/home");
  return session.response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|manifest\\.webmanifest|.*\\.(?:png|svg|ico|jpg|jpeg|gif|webp)$).*)",
  ],
};
