import Image from "next/image";
import { siteConfig } from "@/lib/site";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 pt-[max(2rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(2rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))]">
      <div className="flex flex-col items-center gap-3 text-center">
        {/* The app icon, so a new icon choice updates this screen too. */}
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={64}
          height={64}
          className="size-16 rounded-2xl"
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
