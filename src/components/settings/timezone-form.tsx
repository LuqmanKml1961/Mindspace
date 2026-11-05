"use client";

import {
  useActionState,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { updateTimezoneAction } from "@/app/(app)/settings/actions";
import { DEFAULT_TIMEZONE } from "@/domain/profiles/profile";
import { SubmitButton } from "@/components/forms/form-parts";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { notify } from "@/lib/notify";

const subscribe = () => () => {};
const deviceTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const label = (zone: string) => zone.replaceAll("_", " ");

type TimezoneFormProps = {
  saved: string;
  options: string[];
  labelledBy: string;
};

export function TimezoneForm({
  saved,
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

  // A profile still on the default is pre-filled with the device's zone (not saved yet).
  const suggested =
    saved === DEFAULT_TIMEZONE && detected && detected !== saved
      ? detected
      : null;
  const value = choice ?? suggested ?? saved;
  // The server's list can lack a zone the browser reports, so add any that are missing.
  const missing = [...new Set([value, saved])].filter(
    (zone) => !options.includes(zone),
  );
  const zones = [...missing, ...options];

  return (
    <form action={formAction}>
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
                {label(zone)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldDescription>
            {value === suggested
              ? "Detected from this device. Save to use it."
              : `Saved: ${label(saved)}.`}
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
