import type { EncryptedDailyCheckIn } from "@/domain/check-ins/daily-check-in-repository";
import type { Profile } from "@/domain/profiles/profile";
import type { Reminder } from "@/domain/tasks/reminder";
import type { EncryptedTask } from "@/domain/tasks/task-repository";
import type { EncryptedCategory } from "@/domain/thoughts/category-repository";
import type { EncryptedThought } from "@/domain/thoughts/thought-repository";

// Everything the user owns, as stored: free text is still ciphertext (D-021).
export type AccountRecords = {
  profile: Profile | null;
  categories: EncryptedCategory[];
  thoughts: EncryptedThought[];
  tasks: EncryptedTask[];
  reminders: Reminder[];
  checkIns: EncryptedDailyCheckIn[];
};

// The signed-in user's account on the server (a Server Action). The server takes the user from
// the session, never from the browser.
export interface AccountServer {
  records(): Promise<AccountRecords>;
}

// Deletes the user's sign-in record, on the server only. Every row they own goes with it through
// `on delete cascade`.
export interface AccountAdmin {
  deleteUser(userId: string): Promise<void>;
}
