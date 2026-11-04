import Image from "next/image";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/site";

// A centred page under the logo: the sign-in pages and the lock screen.
export function BrandFrame({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 pt-[max(2rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(2rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))]">
      <div className="flex flex-col items-center gap-3 text-center">
        {/* A white house: the shadow lifts it off the light page (not needed in dark). */}
        <Image
          src="/brand/mindspace-logo.png"
          alt=""
          width={64}
          height={64}
          className="size-16 drop-shadow-[0_2px_8px_rgb(47_62_70_/_0.3)] dark:drop-shadow-none"
        />
        <div className="flex flex-col items-center gap-1">
          <p className="text-2xl font-semibold tracking-tight">
            {siteConfig.name}
          </p>
          <p className="text-sm text-muted-foreground">{siteConfig.tagline}</p>
        </div>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
