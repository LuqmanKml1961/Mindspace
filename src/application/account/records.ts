import type { AccountAdmin, AccountRecords } from "@/application/account/ports";
import type { AuthService } from "@/application/auth/auth-service";
import type { DailyCheckInRepository } from "@/domain/check-ins/daily-check-in-repository";
import type { ProfileRepository } from "@/domain/profiles/profile-repository";
import type { ReminderRepository } from "@/domain/tasks/reminder-repository";
import type { TaskRepository } from "@/domain/tasks/task-repository";
import type { CategoryRepository } from "@/domain/thoughts/category-repository";
import type { ThoughtRepository } from "@/domain/thoughts/thought-repository";

// Every row the user owns, for the data export. The browser decrypts it (D-021).
export function makeGetAccountRecords(deps: {
  profiles: ProfileRepository;
  categories: CategoryRepository;
  thoughts: ThoughtRepository;
  tasks: TaskRepository;
  reminders: ReminderRepository;
  checkIns: DailyCheckInRepository;
}) {
  return async (userId: string): Promise<AccountRecords> => {
    const [profile, categories, thoughts, tasks, reminders, checkIns] =
      await Promise.all([
        deps.profiles.findById(userId),
        deps.categories.list(userId),
        deps.thoughts.list(userId),
        deps.tasks.listAll(userId),
        deps.reminders.listAll(userId),
        deps.checkIns.list(userId),
      ]);
    return { profile, categories, thoughts, tasks, reminders, checkIns };
  };
}

// The sign-in record goes first, so a failure leaves the account as it was, still signed in.
// Signing out then clears this browser's session, which would otherwise stay valid until it
// expires.
export function makeDeleteAccount(deps: {
  accounts: AccountAdmin;
  auth: Pick<AuthService, "signOut">;
}) {
  return async (userId: string): Promise<void> => {
    await deps.accounts.deleteUser(userId);
    await deps.auth.signOut();
  };
}
