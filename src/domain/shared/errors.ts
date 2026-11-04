// A rule was broken by the input; the message is safe to show to the user.
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
