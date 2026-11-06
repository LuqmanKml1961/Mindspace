import type {
  EncryptedDailyCheckIn,
  EncryptedDailyCheckInChanges,
} from "@/domain/check-ins/daily-check-in-repository";

// The signed-in user's check-ins on the server, written from the browser (Server Actions). The
// browser never sends a date or a user id: the server takes both from the session.
export interface CheckInServer {
  // Today's check-in in the user's own time zone, started empty if there is none yet.
  start(): Promise<EncryptedDailyCheckIn>;
  // Throws NotFoundError if the check-in, or the priority task, doesn't exist.
  update(
    id: string,
    edits: EncryptedDailyCheckInChanges,
  ): Promise<EncryptedDailyCheckIn>;
}

// The user's own calendar date (getToday), injected so the use cases can be tested on fixed days.
export type Today = (userId: string) => Promise<string>;
