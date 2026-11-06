import type { Today } from "@/application/check-ins/ports";
import { createDailyCheckIn } from "@/domain/check-ins/daily-check-in";
import type {
  DailyCheckInRepository,
  EncryptedDailyCheckInChanges,
} from "@/domain/check-ins/daily-check-in-repository";
import { ConflictError } from "@/domain/shared/errors";

// Server side (D-021): stores and returns ciphertext only; the answers were checked and
// encrypted on the device. The date is always the user's own today, worked out here, never sent
// by the browser. The user id always comes from the session.

export function makeGetTodayCheckInRecord(deps: {
  checkIns: DailyCheckInRepository;
  today: Today;
}) {
  return async (userId: string) =>
    deps.checkIns.findByDate(userId, await deps.today(userId));
}

// Resumes today's check-in, or starts an empty one. If another device starts it at the same
// moment, the database refuses the second one and that check-in is resumed instead.
export function makeStartCheckInRecord(deps: {
  checkIns: DailyCheckInRepository;
  today: Today;
}) {
  return async (userId: string) => {
    const date = await deps.today(userId);
    const existing = await deps.checkIns.findByDate(userId, date);
    if (existing) return existing;
    // Nothing is written yet, so there is nothing to encrypt.
    const fresh = createDailyCheckIn({ userId, date });
    try {
      return await deps.checkIns.create({
        userId: fresh.userId,
        date: fresh.date,
        occupyingMindCiphertext: null,
        worriesCiphertext: null,
        canControlCiphertext: null,
        canWaitCiphertext: null,
        smallHelpfulThingCiphertext: null,
        priorityTaskId: null,
        priorityTextCiphertext: null,
      });
    } catch (error) {
      if (!(error instanceof ConflictError)) throw error;
      const started = await deps.checkIns.findByDate(userId, date);
      if (!started) throw error;
      return started;
    }
  };
}

// The edits were checked at the Server Action (checkInEditsSchema) and again by the database.
export function makeUpdateCheckInRecord(deps: {
  checkIns: DailyCheckInRepository;
}) {
  return (userId: string, id: string, edits: EncryptedDailyCheckInChanges) =>
    deps.checkIns.update(userId, id, edits);
}

// Newest date first: past reflections (P5.7).
export function makeListCheckInRecords(deps: {
  checkIns: DailyCheckInRepository;
}) {
  return (userId: string) => deps.checkIns.list(userId);
}
