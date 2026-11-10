import type { Metadata } from "next";
import {
  DEFAULT_TIMEZONE,
  shouldDetectTimezone,
  timezoneOptions,
} from "@/domain/profiles/profile";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DataControls } from "@/components/settings/data-controls";
import { TimezoneForm } from "@/components/settings/timezone-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id="appearance-heading">Appearance</h2>
          </CardTitle>
          <CardDescription>
            Choose light or dark, or follow your device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle labelledBy="appearance-heading" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id="timezone-heading">Time zone</h2>
          </CardTitle>
          <CardDescription>
            Mindspace uses it to work out what “today” means for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimezoneForm
            saved={profile?.timezone ?? DEFAULT_TIMEZONE}
            suggestDevice={profile ? shouldDetectTimezone(profile) : false}
            options={timezoneOptions()}
            labelledBy="timezone-heading"
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Your data</h2>
          </CardTitle>
          <CardDescription>
            Take a copy of everything you’ve saved, or delete your account and
            all of it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataControls userId={user.id} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Account</h2>
          </CardTitle>
          {user.email && (
            <CardDescription>
              Signed in as{" "}
              <span className="font-medium text-foreground">{user.email}</span>
            </CardDescription>
          )}
        </CardHeader>
        <CardFooter>
          <SignOutButton />
        </CardFooter>
      </Card>
      <p className="text-sm text-muted-foreground">
        The privacy policy and a way to contact us are coming soon.
      </p>
    </>
  );
}
