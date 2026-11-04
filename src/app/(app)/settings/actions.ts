"use server";

import { revalidatePath } from "next/cache";
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
