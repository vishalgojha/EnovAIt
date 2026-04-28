import type { NextFunction, Request, Response } from "express";
import xss from "xss";

const SAFE_TAGS = ["p", "br", "b", "i", "em", "strong", "a", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "code", "pre"];
const SAFE_ATTRS = ["href", "target", "rel"];

const xssOptions = {
  whiteList: SAFE_TAGS.reduce((acc, tag) => {
    acc[tag] = SAFE_ATTRS;
    return acc;
  }, {} as Record<string, string[]>),
  stripIgnoreTag: false,
  stripIgnoreTagBody: true,
};

const sanitizeUnknown = (value: unknown): unknown => {
  if (typeof value === "string") {
    return xss(value, xssOptions).trim();
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
