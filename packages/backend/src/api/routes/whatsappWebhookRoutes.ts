import { Router } from "express";

import { channelController } from "../controllers/channelController.js";

export const whatsappWebhookRouter = Router();

whatsappWebhookRouter.get("/", channelController.verifyOfficialWebhook);
whatsappWebhookRouter.post("/", channelController.receiveOfficialWebhook);
whatsappWebhookRouter.get("/:integrationId", channelController.verifyOfficialWebhook);
whatsappWebhookRouter.post("/:integrationId", channelController.receiveOfficialWebhook);
