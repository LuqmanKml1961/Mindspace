import type { NextRequest } from "next/server";
import { updateSession } from "@/infrastructure/supabase/session";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|manifest\\.webmanifest|.*\\.(?:png|svg|ico|jpg|jpeg|gif|webp)$).*)",
  ],
};
