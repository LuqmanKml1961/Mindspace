import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/infrastructure/config/env";

// Refreshes the Supabase session on every request (called from src/proxy.ts).
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  let cacheHeaders: Record<string, string> = {};

  const supabase = createServerClient(
    env.supabaseUrl,
    env.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // Cache headers stop a CDN from serving one user's session to another.
          cacheHeaders = headers;
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // Must run before the response is returned so a refreshed token can be written.
  // It verifies the token; an error or a missing session counts as signed out.
  const { data } = await supabase.auth.getClaims();

  return {
    signedIn: Boolean(data?.claims),
    // The response setAll last built; an earlier one lacks the refreshed cookies.
    response,
    redirect(pathname: string) {
      const redirect = NextResponse.redirect(new URL(pathname, request.url));
      // A new response must carry the refreshed cookies and cache headers as well.
      response.cookies
        .getAll()
        .forEach((cookie) => redirect.cookies.set(cookie));
      Object.entries(cacheHeaders).forEach(([key, value]) =>
        redirect.headers.set(key, value),
      );
      return redirect;
    },
  };
}
