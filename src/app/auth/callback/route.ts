import { NextResponse, type NextRequest } from "next/server";
import { getAuthService } from "@/infrastructure/container";

// Google (via Supabase Auth) returns here with ?code=… after the user signs in.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const result = code
    ? await (await getAuthService()).completeOAuthSignIn(code)
    : null;

  return NextResponse.redirect(
    new URL(result?.ok ? "/home" : "/sign-in?error=google", appOrigin(request)),
  );
}

// Behind Vercel's proxy the public host arrives as x-forwarded-host (Supabase's Next.js guide).
function appOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  return process.env.NODE_ENV !== "development" && forwardedHost
    ? `https://${forwardedHost}`
    : request.nextUrl.origin;
}
