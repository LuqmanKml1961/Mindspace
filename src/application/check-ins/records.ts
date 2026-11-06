import type { Today } from "@/application/check-ins/ports";
import { createDailyCheckIn } from "@/domain/check-ins/daily-check-in";
import type {
  DailyCheckInRepository,
  EncryptedDailyCheckIn,
  EncryptedDailyCheckInChanges,
} from "@/domain/check-ins/daily-check-in-repository";
import { ConflictError } from "@/domain/shared/errors";
import type {
  EncryptedTask,
  TaskRepository,
} from "@/domain/tasks/task-repository";

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

// Nothing was written: no answer and no priority.
function isBlank(checkIn: EncryptedDailyCheckIn): boolean {
  return [
    checkIn.occupyingMindCiphertext,
    checkIn.worriesCiphertext,
    checkIn.canControlCiphertext,
    checkIn.canWaitCiphertext,
    checkIn.smallHelpfulThingCiphertext,
    checkIn.priorityTaskId,
    checkIn.priorityTextCiphertext,
  ].every((value) => value === null);
}

// Past reflections (P5.7): the check-ins before today with something written, newest first, and
// the tasks chosen as their one thing, as ciphertext. One read per distinct task, which suits a
// person's list (as for reminders).
export function makeListPastCheckInRecords(deps: {
  checkIns: DailyCheckInRepository;
  tasks: TaskRepository;
  today: Today;
}) {
  return async (
    userId: string,
  ): Promise<{ checkIns: EncryptedDailyCheckIn[]; tasks: EncryptedTask[] }> => {
    const [today, all] = await Promise.all([
      deps.today(userId),
      deps.checkIns.list(userId),
    ]);
    const checkIns = all.filter(
      (checkIn) => checkIn.date < today && !isBlank(checkIn),
    );
    const taskIds = [
      ...new Set(
        checkIns
          .map((checkIn) => checkIn.priorityTaskId)
          .filter((id) => id !== null),
      ),
    ];
    const found = await Promise.all(
      taskIds.map((id) => deps.tasks.findById(userId, id)),
    );
    return { checkIns, tasks: found.filter((task) => task !== null) };
  };
}
