import { Router } from "express";

import { channelController } from "../controllers/channelController.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

export const channelWebhookRouter = Router();

channelWebhookRouter.post("/:channel", asyncHandler(channelController.ingestWebhook));
