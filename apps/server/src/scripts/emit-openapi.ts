import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { openApiSpec } from "../lib/openapi";

async function main() {
  const target = resolve(process.cwd(), "openapi.json");
  await writeFile(target, `${JSON.stringify(openApiSpec, null, 2)}\n`, "utf8");
  console.log(`Wrote OpenAPI spec to ${target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
