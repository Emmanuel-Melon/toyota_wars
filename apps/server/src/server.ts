import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import app from "@/app";
import { logger } from "@/lib/logger";

import { serverConfig } from "./config";
import { gracefulShutdown } from "./lib/express/express.server";

extendZodWithOpenApi(z);

const startServer = async () => {
  try {
    const server = app.listen(serverConfig.port, serverConfig.hostname, () => {
      const baseUrl = `http://${serverConfig.hostname}:${serverConfig.port}`;
      logger.info("\n🔗 Available Endpoints:");
      logger.info(`  🌐 API: ${baseUrl}`);
      logger.info(`  📚 Documentation: ${baseUrl}/api-docs`);
      logger.info(`  📄 OpenAPI Spec: ${baseUrl}/api-docs.json`);
    });

    process.on("SIGTERM", () => gracefulShutdown(server));
    process.on("SIGINT", () => gracefulShutdown(server));
  } catch (err) {
    logger.error({ err }, "Failed to start:");
    process.exit(1);
  }
};

startServer();

export default app;
