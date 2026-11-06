"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { updateTimezoneAction } from "@/app/(app)/settings/actions";
import { SubmitButton } from "@/components/forms/form-parts";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { notify } from "@/lib/notify";

const subscribe = () => () => {};
const deviceTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
export const timezoneLabel = (zone: string) => zone.replaceAll("_", " ");

type TimezoneFormProps = {
  saved: string;
  // True while the profile is as sign-up left it (shouldDetectTimezone).
  suggestDevice: boolean;
  options: string[];
  labelledBy: string;
};

export function TimezoneForm({
  saved,
  suggestDevice,
  options,
  labelledBy,
}: TimezoneFormProps) {
  const [state, formAction, pending] = useActionState(updateTimezoneAction, {});
  // null on the server and during hydration, the device's zone afterwards.
  const detected = useSyncExternalStore(subscribe, deviceTimezone, () => null);
  const [choice, setChoice] = useState<string | null>(null);

  // Each result is a new object, so every save reports once.
  useEffect(() => {
    if (state.notice) notify.success(state.notice);
    if (state.error) notify.error(state.error);
  }, [state]);

  // Normally saved automatically (TimezoneDetector); if that didn't happen, the device's zone is
  // pre-filled here instead. A zone you saved, UTC included, is shown as saved.
  const suggested =
    suggestDevice && detected && detected !== saved ? detected : null;
  const value = choice ?? suggested ?? saved;
  // The server's list can lack a zone the browser reports, so add any that are missing.
  const missing = [...new Set([value, saved])].filter(
    (zone) => !options.includes(zone),
  );
  const zones = [...missing, ...options];

  return (
    <form
      action={formAction}
      // Submitting here skips React's form reset after the action, which would move the controlled
      // select to its first option ("UTC") although the saved zone is right. `action` stays for
      // submits before hydration.
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
      }}
    >
      <FieldGroup>
        <Field>
          <NativeSelect
            name="timezone"
            aria-labelledby={labelledBy}
            className="w-full"
            value={value}
            onChange={(event) => setChoice(event.target.value)}
          >
            {zones.map((zone) => (
              <NativeSelectOption key={zone} value={zone}>
                {timezoneLabel(zone)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldDescription>
            {value === suggested
              ? "Detected from this device. Save to use it."
              : `Saved: ${timezoneLabel(saved)}.`}
          </FieldDescription>
        </Field>
        <div>
          <SubmitButton pending={pending} disabled={value === saved}>
            Save time zone
          </SubmitButton>
        </div>
      </FieldGroup>
    </form>
  );
}
