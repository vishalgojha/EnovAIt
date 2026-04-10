import { Router } from "express";

import { emailIntakeController } from "../controllers/emailIntakeController.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

export const emailIntakeRouter = Router();

emailIntakeRouter.post("/webhook", asyncHandler(emailIntakeController.receiveEmail));
emailIntakeRouter.post("/forward", asyncHandler(emailIntakeController.forwardEvidence));
emailIntakeRouter.get("/templates", asyncHandler(emailIntakeController.getTemplates));
