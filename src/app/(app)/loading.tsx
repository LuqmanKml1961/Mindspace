import { Skeleton } from "@/components/ui/skeleton";

// Shown immediately while a page that reads data (e.g. Settings) loads; Next.js prefetches it.
export default function AppLoading() {
  return (
    <div role="status" className="flex flex-col gap-8">
      <span className="sr-only">Loading…</span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-6 w-72 max-w-full" />
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
