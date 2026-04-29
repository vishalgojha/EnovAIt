import cors from "cors";
import express, { type Request } from "express";
import helmet from "helmet";
import { existsSync } from "node:fs";
import { join, extname } from "node:path";

import { env } from "./config.js";

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
import { whatsappWebhookRouter } from "./api/routes/whatsappWebhookRoutes.js";
import { trustProxy } from "./config.js";
import { requestLogger } from "./lib/logger.js";

export const app = express();
const clientDistDir = join(process.cwd(), "dist", "client");
const hasClientBuild = existsSync(join(clientDistDir, "index.html"));

app.set("trust proxy", trustProxy);
app.use(helmet());

const corsOptions: cors.CorsOptions = {
  origin: env.NODE_ENV === "production" 
    ? (process.env.ALLOWED_ORIGINS?.split(",").filter(Boolean) || [])
    : ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Webhook-Signature-SHA256"],
};
app.use(cors(corsOptions));
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
app.use("/api/v1/channels/whatsapp", webhookLimiter, verifyWebhookSignature, whatsappWebhookRouter);
app.use("/api/v1/public/auth", sanitizeInput, authRouter);
app.use("/api/v1/ai", requireAuth, chatRouter);
app.use("/api/v1", requireAuth, tenantAwareLimiter, sanitizeInput, v1Router);

if (hasClientBuild) {
  app.use(express.static(clientDistDir));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || extname(req.path)) {
      next();
      return;
    }

    res.sendFile(join(clientDistDir, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);
