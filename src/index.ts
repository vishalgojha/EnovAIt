import { app } from "./app.js";
import { env } from "./config.js";
import { logger } from "./lib/logger.js";

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, "EnovAIt backend started");
});
