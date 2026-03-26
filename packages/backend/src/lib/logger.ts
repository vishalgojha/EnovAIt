import type { Request, Response } from "express";
import pino from "pino";
import { pinoHttp } from "pino-http";

import { env } from "../config.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie"],
    censor: "[REDACTED]"
  }
});

export const requestLogger = pinoHttp({
  logger,
  customLogLevel: (_req: Request, res: Response, err?: Error) => {
    if (err || res.statusCode >= 500) {
      return "error";
    }
    if (res.statusCode >= 400) {
      return "warn";
    }
    return "info";
  }
});
