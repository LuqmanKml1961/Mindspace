import type { Metadata } from "next";
import { CaptureBox } from "@/components/thoughts/capture-box";
import { getAppContext } from "@/infrastructure/container";

export const metadata: Metadata = { title: "Brain Dump" };

export default async function ThoughtsPage() {
  const { user } = await getAppContext();

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Brain Dump</h1>
        <p className="text-lg text-muted-foreground">
          Get thoughts out of your head now, and organise them later.
        </p>
      </header>
      <CaptureBox userId={user.id} />
    </>
  );
}
