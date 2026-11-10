// The page's Content Security Policy (P6.6, D-026). Only scripts carrying this request's nonce
// run, and 'strict-dynamic' lets them load the app's own chunks, so an injected script can't
// read what is decrypted in the browser. Nothing is sent to, or loaded from, another site: the
// browser talks only to this app (Supabase is called from the server).
export function contentSecurityPolicy({
  nonce,
  supabaseUrl,
  isDev,
}: {
  nonce: string;
  supabaseUrl: string;
  isDev: boolean;
}): string {
  return [
    "default-src 'self'",
    // React rebuilds server error stacks with eval in development (Next.js CSP guide).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // React and Base UI set style attributes, which a nonce can't cover.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    // A sign-in form submitted before the page's scripts load is redirected to Supabase, then to
    // Google.
    `form-action 'self' ${new URL(supabaseUrl).origin} https://accounts.google.com`,
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}
