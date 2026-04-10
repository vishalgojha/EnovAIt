import { Router } from "express";

import { whatsappIntakeController } from "../controllers/whatsappIntakeController.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

export const whatsappIntakeRouter = Router();

// Send BRSR evidence via WhatsApp text (programmatic intake)
whatsappIntakeRouter.post("/message", asyncHandler(whatsappIntakeController.receiveMessage));

// Send BRSR evidence with explicit org/module context
whatsappIntakeRouter.post("/evidence", asyncHandler(whatsappIntakeController.receiveEvidence));
