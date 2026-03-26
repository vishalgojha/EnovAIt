import type { NextFunction, Request, Response } from "express";
import xss from "xss";

const sanitizeUnknown = (value: unknown): unknown => {
  if (typeof value === "string") {
    return xss(value, {
      whiteList: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: ["script"]
    }).trim();
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeUnknown(item));
  }

  if (value && typeof value === "object") {
    const input = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(input)) {
      out[key] = sanitizeUnknown(child);
    }
    return out;
  }

  return value;
};

export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeUnknown(req.body) as Request["body"];
  }

  if (req.query && typeof req.query === "object") {
    req.query = sanitizeUnknown(req.query) as Request["query"];
  }

  next();
};
