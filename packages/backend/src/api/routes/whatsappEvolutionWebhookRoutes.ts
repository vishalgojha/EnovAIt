import { Router } from "express";

import { channelController } from "../controllers/channelController.js";

export const whatsappEvolutionWebhookRouter = Router();

whatsappEvolutionWebhookRouter.post("/", channelController.receiveEvolutionWebhook);
whatsappEvolutionWebhookRouter.post("/:integrationId", channelController.receiveEvolutionWebhook);
