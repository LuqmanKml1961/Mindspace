// A rule was broken by the input; the message is safe to show to the user.
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// The item does not exist, or belongs to someone else (RLS hides it either way).
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

// The change would duplicate something that must be unique; the message is safe to show.
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
