import { AppError } from "./errors.js";

export interface RetryOptions {
  attempts: number;
  baseDelayMs: number;
  maxDelayMs?: number;
  jitterRatio?: number;
  isRetryable?: (error: unknown) => boolean;
}

const wait = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const defaultRetryable = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybe = error as { status?: number; code?: string; message?: string };

  if (typeof maybe.status === "number") {
    return maybe.status === 429 || maybe.status >= 500;
  }

  if (typeof maybe.code === "string") {
    return ["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED"].includes(maybe.code);
  }

  if (typeof maybe.message === "string") {
    return /timeout|temporarily unavailable|rate limit/i.test(maybe.message);
  }

  return false;
};

export const withRetry = async <T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions
): Promise<T> => {
  const attempts = Math.max(1, options.attempts);
  const maxDelay = options.maxDelayMs ?? 10_000;
  const jitter = options.jitterRatio ?? 0.2;
  const isRetryable = options.isRetryable ?? defaultRetryable;

  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;

      if (attempt >= attempts || !isRetryable(error)) {
        break;
      }

      const exp = options.baseDelayMs * Math.pow(2, attempt - 1);
      const baseDelay = Math.min(exp, maxDelay);
      const jitterDelta = baseDelay * jitter;
      const randomized = baseDelay + (Math.random() * 2 - 1) * jitterDelta;
      const delayMs = Math.max(0, Math.floor(randomized));
      await wait(delayMs);
    }
  }

  throw new AppError("Operation failed after retries", 502, "RETRY_EXHAUSTED", {
    attempts,
    last_error: lastError
  });
};
