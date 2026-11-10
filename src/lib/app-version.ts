// Vercel gives every deployment its own ID, so each deploy is a new version of the app and of
// its service worker (P6.2). Elsewhere, such as a local production build, the version is fixed.
export const appVersion = process.env.VERCEL_DEPLOYMENT_ID ?? "local";
