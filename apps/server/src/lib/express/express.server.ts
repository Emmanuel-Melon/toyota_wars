import type { Server } from "http";

import { closeDb } from "@/lib/drizzle";
import { logger } from "@/lib/logger";

export const gracefulShutdown = async (server: Server) => {
  logger.info("Shutting down server...");
  server.close(async () => {
    await closeDb();
    logger.info("Server stopped");
    process.exit(0);
  });
};
