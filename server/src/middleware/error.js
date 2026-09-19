/** Thrown by services/controllers for expected, client-facing errors. */
export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Catches everything. Known AppErrors pass their message through; anything
// else is logged in full server-side and returned to the client as a
// generic 500 — never leak internal error details to users.
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message });
  }

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    const messages = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    return res.status(400).json({ message: messages });
  }

  console.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);
  res.status(500).json({ message: "Internal server error" });
}

/** Wraps an async route handler so rejected promises reach errorHandler. */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
