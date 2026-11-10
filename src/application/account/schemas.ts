import { z } from "zod";

// Typed by the user to confirm deleting their account; checked in the dialog and on the server.
export const DELETE_ACCOUNT_WORD = "delete";

export const deleteAccountConfirmationSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.literal(DELETE_ACCOUNT_WORD));
