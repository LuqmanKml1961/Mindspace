// Mindspace's service worker (P6.2). route.ts serves it at /sw.js with VERSION set first.
// Pages and data always come from the network and are never stored. The only thing kept is the
// offline page with its styles, scripts and images, renewed with every deploy.

const CACHE = `mindspace-${VERSION}`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(storeOfflinePage().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(activate());
});

// A page asks which version is running when it comes back to the foreground.
self.addEventListener("message", (event) => {
  if (event.data === "version") {
    event.source?.postMessage({ type: "version", version: VERSION });
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(navigate(event));
  } else if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/_next/image"
  ) {
    event.respondWith(storedOrNetwork(request));
  }
});

async function storeOfflinePage() {
  const cache = await caches.open(CACHE);
  const page = await fetch(OFFLINE_URL, { cache: "reload" });
  if (!page.ok || page.redirected) {
    throw new Error("The offline page did not load.");
  }
  const html = await page.clone().text();
  await cache.put(OFFLINE_URL, page);

  const assets = new Set(
    Array.from(
      html.matchAll(/\/_next\/(?:static\/|image\?)[^"'\s,\\)]+/g),
      ([url]) => url.replaceAll("&amp;", "&"),
    ),
  );
  // Without one of these the page still shows, just less styled.
  await Promise.allSettled([...assets].map((url) => cache.add(url)));
}

async function activate() {
  const names = await caches.keys();
  await Promise.all(
    names
      .filter((name) => name.startsWith("mindspace-") && name !== CACHE)
      .map((name) => caches.delete(name)),
  );
  await self.registration.navigationPreload?.enable();
  await self.clients.claim();

  // Open pages compare this with their own version, to offer a refresh after a deploy.
  const pages = await self.clients.matchAll({ type: "window" });
  for (const page of pages) {
    page.postMessage({ type: "version", version: VERSION });
  }
}

async function navigate(event) {
  try {
    return (await event.preloadResponse) ?? (await fetch(event.request));
  } catch {
    return (await caches.match(OFFLINE_URL)) ?? Response.error();
  }
}

async function storedOrNetwork(request) {
  return (await caches.match(request, { ignoreVary: true })) ?? fetch(request);
}
