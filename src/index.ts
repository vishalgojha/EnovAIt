import { app } from "./app.js";
import { env } from "./config.js";
import { logger } from "./lib/logger.js";
import { startWorkers, stopWorkers } from "./workers/index.js";

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
