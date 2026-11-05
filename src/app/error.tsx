"use client";

import { useEffect } from "react";
import { BrandFrame } from "@/components/layout/brand-frame";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Catches errors while a page or the signed-in layout loads (for example if the database is
// unreachable). retry() fetches the page again.
export default function AppError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    // Only the digest, which matches the server log; never the details.
    const digest =
      error instanceof Error && "digest" in error ? error.digest : undefined;
    console.error(digest ? `Page failed to load (${digest})` : "Page failed");
  }, [error]);

  return (
    <BrandFrame>
      <Card>
        <CardHeader>
          <CardTitle>
            <h1>This didn’t load</h1>
          </CardTitle>
          <CardDescription>
            Something went wrong on our side. It’s usually brief, so please try
            again in a moment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => retry()}>Try again</Button>
        </CardContent>
      </Card>
    </BrandFrame>
  );
}
