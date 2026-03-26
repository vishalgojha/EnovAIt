import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { errorHandler } from "./api/middlewares/errorHandler.js";
import { notFoundHandler } from "./api/middlewares/notFound.js";
import { requireAuth } from "./api/middlewares/requireAuth.js";
import { healthRouter } from "./api/routes/healthRoutes.js";
import { v1Router } from "./api/routes/v1Router.js";
import { whatsappWebhookRouter } from "./api/routes/whatsappWebhookRoutes.js";
import { env } from "./config.js";
import { requestLogger } from "./lib/logger.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api", limiter);

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/channels/whatsapp/official/webhook", whatsappWebhookRouter);
app.use("/api/v1", requireAuth, v1Router);

app.use(notFoundHandler);
app.use(errorHandler);
