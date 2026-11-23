import path from "path";
import { glob } from "glob";

import { logger } from "@/lib/logger";

import { runMigrations } from "./drizzle.migrations";

export const randomElement = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

async function main() {
  try {
    logger.info("🚀 Starting game database seed...");

    await runMigrations();

    const seedFiles = await glob("src/feature/**/*.seed.ts", {
      absolute: true,
    });

    for (const filePath of seedFiles) {
      const module = await import(`file://${filePath}`);

      const seedFunctionName = Object.keys(module).find((key) =>
        key.startsWith("seed"),
      );

      if (seedFunctionName && typeof module[seedFunctionName] === "function") {
        await module[seedFunctionName]();
      } else {
        logger.warn(`⚠️ No seed function found in ${path.basename(filePath)}`);
      }
    }

    logger.info("\n🎉 All seeds completed successfully!");
    process.exit(0);
  } catch (error) {
    logger.error({ error }, "\n💥 Global seeding failed:");
    process.exit(1);
  }
}

main();
