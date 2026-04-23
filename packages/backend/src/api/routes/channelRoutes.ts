import { Router } from "express";

import { channelController } from "../controllers/channelController.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

export const channelRouter = Router();

channelRouter.post("/send", asyncHandler(channelController.sendMessage));
channelRouter.get("/status/:channel", asyncHandler(channelController.getStatus));

// Backward-compatible WhatsApp routes
channelRouter.post("/whatsapp/send", asyncHandler(channelController.sendWhatsAppMessage));
channelRouter.get("/whatsapp/baileys/status", asyncHandler(channelController.getBaileysStatus));
channelRouter.get("/whatsapp/baileys/qr", asyncHandler(channelController.getBaileysQr));
channelRouter.post("/whatsapp/baileys/disconnect", asyncHandler(channelController.disconnectBaileys));
