import { Router } from "express";

import { chatController } from "../controllers/chatController.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

export const chatRouter = Router();

chatRouter.post("/message", asyncHandler(chatController.postMessage));
