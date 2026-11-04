import type { Metadata } from "next";
import { signOutAction } from "@/app/(auth)/actions";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-lg text-muted-foreground">
          Your account, privacy, preferences and data.
        </p>
      </header>
      <section className="flex flex-col gap-3">
        <h2 id="appearance-heading" className="text-lg font-semibold">
          Appearance
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose light or dark, or follow your device.
        </p>
        <ThemeToggle labelledBy="appearance-heading" />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Account</h2>
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </section>
      <p className="text-sm text-muted-foreground">
        More account, privacy and data settings are coming soon.
      </p>
    </>
  );
}
