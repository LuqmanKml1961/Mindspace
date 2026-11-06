import {
  startCheckInAction,
  updateCheckInAction,
} from "@/app/(app)/clarity/actions";
import type { CheckInServer } from "@/application/check-ins/ports";
import { createCheckInUseCases } from "@/infrastructure/browser";
import { unwrap } from "@/lib/action-errors";

// Only ciphertext goes to the server (D-021); the use cases encrypt before calling these.
const checkIns: CheckInServer = {
  start: async () => unwrap(await startCheckInAction()),
  update: async (id, edits) => unwrap(await updateCheckInAction(id, edits)),
};

export const checkInUseCases = createCheckInUseCases(checkIns);
