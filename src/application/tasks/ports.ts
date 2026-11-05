import type {
  EncryptedTask,
  EncryptedTaskChanges,
  NewEncryptedTask,
} from "@/domain/tasks/task-repository";

// What the browser sends: the server takes the user id from the session, never from here.
export type EncryptedTaskInput = Omit<NewEncryptedTask, "userId">;

// Edits from the browser. Completion has its own server use cases, which use the server's clock.
export type EncryptedTaskEdits = Omit<EncryptedTaskChanges, "completedAt">;

// The signed-in user's tasks on the server, written from the browser (Server Actions).
export interface TaskServer {
  // Throws NotFoundError if the source thought doesn't exist.
  create(task: EncryptedTaskInput): Promise<EncryptedTask>;
  // Throws NotFoundError if the task doesn't exist.
  update(id: string, changes: EncryptedTaskEdits): Promise<EncryptedTask>;
  // Throws NotFoundError if the task doesn't exist.
  delete(id: string): Promise<void>;
}

// The current time; injected so the use cases can be tested at fixed moments.
export type Clock = () => Date;
