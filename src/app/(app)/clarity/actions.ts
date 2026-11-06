"use server";

import { refresh } from "next/cache";
import { checkInEditsSchema } from "@/application/check-ins/schemas";
import { idSchema } from "@/application/thoughts/schemas";
import type { EncryptedDailyCheckIn } from "@/domain/check-ins/daily-check-in-repository";
import { getAppContext } from "@/infrastructure/container";
import { attempt, failure, type ActionResult } from "@/lib/action-result";

// Writes only (reads happen in Server Components). The browser sends ciphertext for every answer
// and the written priority (D-021), and never a date: today is worked out here from the user's
// own time zone. Each action checks the user and the input, and refreshes the page.

async function refreshed<T>(work: () => Promise<T>): Promise<T> {
  const result = await work();
  refresh();
  return result;
}

export async function startCheckInAction(): Promise<
  ActionResult<EncryptedDailyCheckIn>
> {
  const { user, useCases } = await getAppContext();
  return attempt(() => refreshed(() => useCases.startCheckInRecord(user.id)));
}

export async function updateCheckInAction(
  id: unknown,
  edits: unknown,
): Promise<ActionResult<EncryptedDailyCheckIn>> {
  const { user, useCases } = await getAppContext();
  const parsedId = idSchema.safeParse(id);
  const parsed = checkInEditsSchema.safeParse(edits);
  if (!parsedId.success || !parsed.success) {
    return failure(new Error("Invalid check-in edits"));
  }
  return attempt(() =>
    refreshed(() =>
      useCases.updateCheckInRecord(user.id, parsedId.data, parsed.data),
    ),
  );
}
