import { accountRecordsAction } from "@/app/(app)/settings/actions";
import type { AccountServer } from "@/application/account/ports";
import { createAccountUseCases } from "@/infrastructure/browser";
import { unwrap } from "@/lib/action-errors";

// The records arrive as ciphertext; the export decrypts them on this device (D-021).
const account: AccountServer = {
  records: async () => unwrap(await accountRecordsAction()),
};

export const accountUseCases = createAccountUseCases(account);
