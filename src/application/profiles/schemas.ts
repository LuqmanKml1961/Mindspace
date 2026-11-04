import { z } from "zod";

// Shape only; the domain checks that it is a real IANA time zone.
export const timezoneFormSchema = z.object({
  timezone: z.string().trim().min(1, { error: "Choose a time zone." }),
});
