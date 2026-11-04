import type { Metadata } from "next";
import { signOutAction } from "@/app/(auth)/actions";
import { DEFAULT_TIMEZONE, timezoneOptions } from "@/domain/profiles/profile";
import { TimezoneForm } from "@/components/settings/timezone-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { getAppContext } from "@/infrastructure/container";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { user, useCases } = await getAppContext();
  const profile = await useCases.getProfile(user.id);

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
        <h2 id="timezone-heading" className="text-lg font-semibold">
          Time zone
        </h2>
        <p className="text-sm text-muted-foreground">
          Mindspace uses it to work out what “today” means for you.
        </p>
        <TimezoneForm
          saved={profile?.timezone ?? DEFAULT_TIMEZONE}
          options={timezoneOptions()}
          labelledBy="timezone-heading"
        />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Account</h2>
        {user.email && (
          <p className="text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">{user.email}</span>
          </p>
        )}
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
