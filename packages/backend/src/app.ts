import cors from "cors";
import express, { type Request } from "express";
import helmet from "helmet";

import { errorHandler } from "./api/middlewares/errorHandler.js";
import { globalApiLimiter, tenantAwareLimiter, webhookLimiter } from "./api/middlewares/rateLimiters.js";
import { sanitizeInput } from "./api/middlewares/sanitizeInput.js";
import { verifyWebhookSignature } from "./api/middlewares/verifyWebhookSignature.js";
import { notFoundHandler } from "./api/middlewares/notFound.js";
import { requireAuth } from "./api/middlewares/requireAuth.js";
import { authRouter } from "./api/routes/authRoutes.js";
import { channelWebhookRouter } from "./api/routes/channelWebhookRoutes.js";
import { healthRouter } from "./api/routes/healthRoutes.js";
import { chatRouter } from "./api/routes/chatRoutes.js";
import { v1Router } from "./api/routes/v1Router.js";
import { whatsappEvolutionWebhookRouter } from "./api/routes/whatsappEvolutionWebhookRoutes.js";
import { whatsappWebhookRouter } from "./api/routes/whatsappWebhookRoutes.js";
import { requestLogger } from "./lib/logger.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(
  express.json({
    limit: "2mb",
    verify: (req, _res, buf) => {
      (req as unknown as Request).rawBody = buf.toString("utf8");
    }
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);

app.use("/api", globalApiLimiter);

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/channels/webhooks", webhookLimiter, verifyWebhookSignature, channelWebhookRouter);
app.use("/api/v1/channels/whatsapp/official/webhook", webhookLimiter, verifyWebhookSignature, whatsappWebhookRouter);
app.use("/api/v1/channels/whatsapp/evolution/webhook", webhookLimiter, verifyWebhookSignature, whatsappEvolutionWebhookRouter);
app.use("/api/v1/public/auth", sanitizeInput, authRouter);
app.use("/api/v1/ai", requireAuth, chatRouter);
app.use("/api/v1", requireAuth, tenantAwareLimiter, sanitizeInput, v1Router);

app.use(notFoundHandler);
app.use(errorHandler);
