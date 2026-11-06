// A check-in as the server stores it (D-021): every answer and the written priority are
// ciphertext, encrypted on the device after the domain rules ran there. The date and the
// priority task stay readable, so today's check-in can be found and the task linked.
export type EncryptedDailyCheckIn = {
  id: string;
  userId: string;
  date: string;
  occupyingMindCiphertext: string | null;
  worriesCiphertext: string | null;
  canControlCiphertext: string | null;
  canWaitCiphertext: string | null;
  smallHelpfulThingCiphertext: string | null;
  priorityTaskId: string | null;
  priorityTextCiphertext: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// The database assigns id and timestamps.
export type NewEncryptedDailyCheckIn = Omit<
  EncryptedDailyCheckIn,
  "id" | "createdAt" | "updatedAt"
>;

export type EncryptedDailyCheckInChanges = Partial<
  Omit<
    EncryptedDailyCheckIn,
    "id" | "userId" | "date" | "createdAt" | "updatedAt"
  >
>;

// Every method is scoped to userId, on top of RLS.
export interface DailyCheckInRepository {
  // Throws ConflictError if the user already has a check-in for that date (another device may
  // have started it), and NotFoundError if the priority task doesn't exist for this user.
  create(checkIn: NewEncryptedDailyCheckIn): Promise<EncryptedDailyCheckIn>;
  findByDate(
    userId: string,
    date: string,
  ): Promise<EncryptedDailyCheckIn | null>;
  // Newest date first.
  list(userId: string): Promise<EncryptedDailyCheckIn[]>;
  // Throws NotFoundError if the check-in, or the priority task it points to, doesn't exist for
  // this user.
  update(
    userId: string,
    id: string,
    changes: EncryptedDailyCheckInChanges,
  ): Promise<EncryptedDailyCheckIn>;
}
