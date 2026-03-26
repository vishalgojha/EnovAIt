import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { isAppError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request payload",
        details: err.flatten()
      }
    });
    return;
  }

  if (isAppError(err)) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? null
      }
    });
    return;
  }

  logger.error({ err, path: req.path }, "Unhandled error");
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Unexpected server error"
    }
  });
};
