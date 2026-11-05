import { NotFoundError, ValidationError } from "@/domain/shared/errors";

// What a Server Action returns: errors travel as values, so their message reaches the browser.
export type ActionResult<T> =
  { ok: true; data: T } | { ok: false; error: string };

const unavailable =
  "Something went wrong on our side. Please try again in a moment.";

// Only messages written for people are passed on. Anything else is logged by its message alone
// (repository errors carry only a Postgres code) and replaced with a general one.
export function failure(error: unknown): { ok: false; error: string } {
  if (error instanceof NotFoundError || error instanceof ValidationError) {
    return { ok: false, error: error.message };
  }
  console.error(error instanceof Error ? error.message : "An action failed");
  return { ok: false, error: unavailable };
}

export async function attempt<T>(
  work: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await work() };
  } catch (error) {
    return failure(error);
  }
}
