import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    tsconfigPaths({ projects: [path.resolve(__dirname, "tsconfig.json")] }),
  ],
  test: {
    name: "integration",
    globals: true,
    environment: "node",
    env: {
      // Vite defaults BASE_URL to "/"; the API requires an absolute URL.
      BASE_URL: process.env.BASE_URL || "http://localhost:3000",
    },
    setupFiles: ["./src/tests/tests.integration.setup.ts"],
    include: ["src/**/*.controller.test.ts"],
    hookTimeout: 30000,
  },
});
