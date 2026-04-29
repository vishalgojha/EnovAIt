import { Router } from "express";

import { channelController } from "../controllers/channelController.js";

export const whatsappWebhookRouter = Router();

whatsappWebhookRouter.get("/", channelController.ingestWebhook);
whatsappWebhookRouter.post("/", channelController.ingestWebhook);
whatsappWebhookRouter.get("/:integrationId", channelController.ingestWebhook);
whatsappWebhookRouter.post("/:integrationId", channelController.ingestWebhook);
