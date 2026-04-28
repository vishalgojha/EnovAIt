import { app } from "./app.js";
import { env } from "./config.js";
import { logger } from "./lib/logger.js";
import { runStartupHealthChecks } from "./lib/healthCheck.js";
import { startWorkers, stopWorkers } from "./workers/index.js";
import { selfHeal } from "./services/selfHeal.js";

const start = async (): Promise<void> => {
  // Self-heal: run diagnostics and fixes before starting
  try {
    await selfHeal();
  } catch (err) {
    logger.warn({ err }, "Self-heal encountered issues — starting anyway");
  }

  // Run startup health checks
  try {
    await runStartupHealthChecks();
  } catch (err) {
    logger.error({ err }, "Startup health checks failed");
    if (env.NODE_ENV === "production") {
      process.exit(1);
    }
  }

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, "EnovAIt backend started");
    startWorkers();
  });

  let shuttingDown = false;

  const shutdown = (signal: string): void => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;

    logger.info({ signal }, "Shutdown signal received");
    stopWorkers();

    server.close((error) => {
      if (error) {
        logger.error({ err: error }, "Error while closing HTTP server");
        process.exitCode = 1;
      }
      process.exit();
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

void start().catch((error) => {
  logger.error({ err: error }, "Failed to start EnovAIt backend");
  process.exit(1);
});
