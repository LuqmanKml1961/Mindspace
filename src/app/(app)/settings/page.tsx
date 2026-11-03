import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      <p className="text-lg text-muted-foreground">
        Your account, privacy, preferences and data.
      </p>
      <p className="text-sm text-muted-foreground">Coming soon.</p>
    </header>
  );
}
