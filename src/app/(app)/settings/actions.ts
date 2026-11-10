"use server";

import { refresh, revalidatePath } from "next/cache";
import type { AccountRecords } from "@/application/account/ports";
import {
  DELETE_ACCOUNT_WORD,
  deleteAccountConfirmationSchema,
} from "@/application/account/schemas";
import { timezoneFormSchema } from "@/application/profiles/schemas";
import { ValidationError } from "@/domain/shared/errors";
import { getAppContext } from "@/infrastructure/container";
import { attempt, type ActionResult } from "@/lib/action-result";

export type TimezoneFormState = { error?: string; notice?: string };

export async function updateTimezoneAction(
  _previous: TimezoneFormState,
  formData: FormData,
): Promise<TimezoneFormState> {
  const { user, useCases } = await getAppContext();

  const value = formData.get("timezone");
  const parsed = timezoneFormSchema.safeParse({
    timezone: typeof value === "string" ? value : "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  try {
    await useCases.updateTimezone({
      userId: user.id,
      timezone: parsed.data.timezone,
    });
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message };
    console.error(
      error instanceof Error ? error.message : "Timezone update failed",
    );
    return {
      error: "Something went wrong on our side. Please try again in a moment.",
    };
  }

  revalidatePath("/settings");
  return { notice: "Time zone saved." };
}

// Called once by TimezoneDetector (DATA_MODEL Q-5). Returns the saved zone, or null when nothing
// was saved; the use case checks again that the profile is still as sign-up left it.
export async function saveDetectedTimezoneAction(
  timezone: unknown,
): Promise<string | null> {
  const { user, useCases } = await getAppContext();
  const parsed = timezoneFormSchema.safeParse({ timezone });
  if (!parsed.success) return null;

  try {
    const saved = await useCases.saveDetectedTimezone({
      userId: user.id,
      timezone: parsed.data.timezone,
    });
    // The open page shows the new zone, and the layout stops rendering the detector.
    if (saved) refresh();
    return saved;
  } catch (error) {
    if (!(error instanceof ValidationError)) {
      console.error(
        error instanceof Error ? error.message : "Saving the time zone failed",
      );
    }
    return null;
  }
}

// Every row the user owns, still encrypted; the browser decrypts it for the export (D-021).
export async function accountRecordsAction(): Promise<
  ActionResult<AccountRecords>
> {
  const { user, useCases } = await getAppContext();
  return attempt(() => useCases.getAccountRecords(user.id));
}

// The account comes from the session, never from the browser. The typed word is checked here
// too, so only a confirmed request deletes anything.
export async function deleteAccountAction(
  confirmation: unknown,
): Promise<ActionResult<null>> {
  const { user, useCases } = await getAppContext();
  if (!deleteAccountConfirmationSchema.safeParse(confirmation).success) {
    return { ok: false, error: `Type “${DELETE_ACCOUNT_WORD}” to confirm.` };
  }
  return attempt(async () => {
    await useCases.deleteAccount(user.id);
    return null;
  });
}
