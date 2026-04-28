import { createHmac, timingSafeEqual } from "crypto";
import type { NextFunction, Request, Response } from "express";

import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";

const signatureHeaders = [
  "x-webhook-signature-sha256",
  "x-signature",
  "x-hub-signature-256",
  "x-razorpay-signature"
] as const;

const extractSignature = (req: Request): string | null => {
  for (const header of signatureHeaders) {
    const value = req.header(header);
    if (value) {
      if (value.startsWith("sha256=")) {
        return value.slice("sha256=".length).trim();
      }
      return value.trim();
    }
  }
  return null;
};

export const verifyWebhookSignature = (req: Request, _res: Response, next: NextFunction): void => {
  if (!env.WEBHOOK_SIGNING_SECRET) {
    if (env.NODE_ENV === "production") {
      next(new AppError("Webhook signing secret not configured", 500, "WEBHOOK_SECRET_NOT_CONFIGURED"));
      return;
    }
    next();
    return;
  }

  const rawBody = req.rawBody;
  if (!rawBody) {
    next(new AppError("Missing raw webhook payload", 400, "MISSING_WEBHOOK_PAYLOAD"));
    return;
  }

  const provided = extractSignature(req);
  if (!provided) {
    next(new AppError("Missing webhook signature header", 401, "MISSING_WEBHOOK_SIGNATURE"));
    return;
  }

  const expected = createHmac("sha256", env.WEBHOOK_SIGNING_SECRET).update(rawBody).digest("hex");
  const providedBuf = Buffer.from(provided, "hex");
  const expectedBuf = Buffer.from(expected, "hex");

  if (providedBuf.length !== expectedBuf.length || !timingSafeEqual(providedBuf, expectedBuf)) {
    next(new AppError("Invalid webhook signature", 401, "INVALID_WEBHOOK_SIGNATURE"));
    return;
  }

  next();
};
