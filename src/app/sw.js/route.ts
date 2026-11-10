import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { appVersion } from "@/lib/app-version";

// Built once per deploy, so a new deploy gives browsers a new worker to install (P6.2).
export const dynamic = "force-static";

export async function GET() {
  const worker = await readFile(
    join(process.cwd(), "src/app/sw.js/service-worker.js"),
    "utf8",
  );
  return new Response(
    `const VERSION = ${JSON.stringify(appVersion)};\n${worker}`,
    {
      headers: {
        "Content-Type": "text/javascript; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    },
  );
}
