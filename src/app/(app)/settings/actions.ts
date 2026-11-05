"use server";

import { refresh, revalidatePath } from "next/cache";
import { timezoneFormSchema } from "@/application/profiles/schemas";
import { ValidationError } from "@/domain/shared/errors";
import { getAppContext } from "@/infrastructure/container";

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
