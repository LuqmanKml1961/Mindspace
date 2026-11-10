import type { AccountServer } from "@/application/account/ports";
import { makeOpenCheckIns } from "@/application/check-ins/check-ins";
import { requireDeviceKey } from "@/application/encryption/device-key";
import type {
  DeviceKeyStore,
  FieldCrypto,
} from "@/application/encryption/ports";
import { makeOpenTasks } from "@/application/tasks/tasks";
import { makeOpenCategories } from "@/application/thoughts/categories";
import { makeOpenThoughts } from "@/application/thoughts/thoughts";
import type { DailyCheckIn } from "@/domain/check-ins/daily-check-in";
import type { Profile } from "@/domain/profiles/profile";
import type { Reminder } from "@/domain/tasks/reminder";
import type { Task } from "@/domain/tasks/task";
import type { Category } from "@/domain/thoughts/category";
import type { Thought } from "@/domain/thoughts/thought";

// The data export (P6.5): everything the user owns, readable. It is decrypted on this device,
// so the server never sees the plain text (D-021), and the file itself is not encrypted.
export type AccountExport = {
  version: 1;
  exportedAt: string;
  profile: Profile | null;
  categories: Category[];
  thoughts: Thought[];
  tasks: Task[];
  reminders: Reminder[];
  checkIns: DailyCheckIn[];
};

export function makeExportAccount(deps: {
  crypto: FieldCrypto;
  device: DeviceKeyStore;
  server: AccountServer;
}) {
  const openCategories = makeOpenCategories(deps);
  const openThoughts = makeOpenThoughts(deps);
  const openTasks = makeOpenTasks(deps);
  const openCheckIns = makeOpenCheckIns(deps);

  return async ({
    userId,
    now,
  }: {
    userId: string;
    now: Date;
  }): Promise<AccountExport> => {
    // Checked first, so a locked device doesn't fetch what it can't read.
    await requireDeviceKey(deps.device, userId);
    const records = await deps.server.records();
    const [categories, thoughts, tasks, checkIns] = await Promise.all([
      openCategories({ userId, records: records.categories }),
      openThoughts({ userId, records: records.thoughts }),
      openTasks({ userId, records: records.tasks }),
      openCheckIns({ userId, records: records.checkIns }),
    ]);
    return {
      version: 1,
      exportedAt: now.toISOString(),
      profile: records.profile,
      categories,
      thoughts,
      tasks,
      reminders: records.reminders,
      checkIns,
    };
  };
}
