import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../lib/errors.js";

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  const role = req.auth?.role;
  if (!role || !["owner", "admin"].includes(role)) {
    next(new AppError("Admin access required", 403, "FORBIDDEN"));
    return;
  }
  next();
};
