import type { Metadata } from "next";
import { BrandFrame } from "@/components/layout/brand-frame";
import { ReloadButton } from "@/components/pwa/reload-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Offline" };

// The service worker shows this page when a page can't load without a connection (P6.2).
export default function OfflinePage() {
  return (
    <BrandFrame>
      <Card>
        <CardHeader>
          <CardTitle>
            <h1>You’re offline</h1>
          </CardTitle>
          <CardDescription>
            Mindspace needs a connection to open this page. Everything you’ve
            saved is safe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReloadButton />
        </CardContent>
      </Card>
    </BrandFrame>
  );
}
