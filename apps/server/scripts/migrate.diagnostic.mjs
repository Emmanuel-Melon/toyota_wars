#!/usr/bin/env node
/**
 * Diagnostic replacement for `npx drizzle-kit migrate`.
 *
 * `drizzle-kit migrate` swallows the underlying Postgres error: its TaskView
 * `render(status)` ignores the `err` argument, so a rejected migration prints the
 * same "[⣷] applying migrations..." spinner text as a running one and exits 1.
 * This runner reproduces drizzle's exact migrate semantics (same journal parsing,
 * same sha256 hashing, same single-transaction apply, same drizzle.__drizzle_migrations
 * bookkeeping) while logging every statement so a failure identifies the exact
 * migration file, statement index, and SQL.
 *
 * Plain .mjs on purpose: runs on the deploy host with bare `node` and no transpile
 * or build step, so it cannot fail for toolchain reasons.
 *
 * Usage:
 *   node scripts/migrate.diagnostic.mjs           # apply pending migrations
 *   node scripts/migrate.diagnostic.mjs --check   # report pending, apply nothing
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { Client } from "pg";

const MIGRATIONS_FOLDER = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "drizzle",
);
const MIGRATIONS_SCHEMA = "drizzle";
const MIGRATIONS_TABLE = "__drizzle_migrations";

const CHECK_ONLY = process.argv.includes("--check");

function redact(url) {
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = "***";
    return parsed.toString();
  } catch {
    return "<unparseable DATABASE_URL>";
  }
}

function fail(message, detail) {
  console.error(
    `\n::error title=Migration failed::${message.replace(/\n/g, "%0A")}`,
  );
  if (detail) console.error(detail);
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  fail(
    "DATABASE_URL is not set",
    "drizzle.config.ts would fall back to postgres://postgres@localhost:5432/postgres",
  );
}

console.log("::group::Migration diagnostics");
console.log(`node                 ${process.version}`);
console.log(`DATABASE_URL         ${redact(connectionString)}`);
console.log(`migrations folder    ${MIGRATIONS_FOLDER}`);

const journalPath = `${MIGRATIONS_FOLDER}/meta/_journal.json`;
if (!existsSync(journalPath)) {
  fail(
    `No journal at ${journalPath}`,
    "Expected drizzle/meta/_journal.json to be deployed.",
  );
}

const journal = JSON.parse(readFileSync(journalPath, "utf8"));
const migrations = readMigrationFiles({ migrationsFolder: MIGRATIONS_FOLDER });

console.log(`journal entries      ${journal.entries.length}`);
console.log(`migration files      ${migrations.length}`);
for (const [index, entry] of journal.entries.entries()) {
  const file = `${MIGRATIONS_FOLDER}/${entry.tag}.sql`;
  const exists = existsSync(file);
  console.log(
    `  [${index}] ${entry.tag}  when=${entry.when}  ` +
      `${exists ? `${migrations[index].sql.length} statements` : "MISSING .sql FILE"}`,
  );
  if (!exists) fail(`Journal references a missing migration file: ${file}`);
}
console.log("::endgroup::");

const client = new Client({ connectionString });
try {
  await client.connect();
} catch (error) {
  fail(
    `Cannot connect to Postgres: ${error.message}`,
    `code=${error.code ?? "n/a"}`,
  );
}

let serverInfo;
try {
  const result = await client.query(
    "select version() as version, current_database() as db, current_user as usr",
  );
  serverInfo = result.rows[0];
} catch (error) {
  fail(`Connected but could not query the server: ${error.message}`);
}
console.log(
  `\nserver               ${serverInfo.version.split(" ").slice(0, 2).join(" ")}`,
);
console.log(`database             ${serverInfo.db}`);
console.log(`user                 ${serverInfo.usr}`);

await client.query(`CREATE SCHEMA IF NOT EXISTS "${MIGRATIONS_SCHEMA}"`);
await client.query(
  `CREATE TABLE IF NOT EXISTS "${MIGRATIONS_SCHEMA}"."${MIGRATIONS_TABLE}" (
     id SERIAL PRIMARY KEY,
     hash text NOT NULL,
     created_at bigint
   )`,
);

const { rows: applied } = await client.query(
  `select id, hash, created_at from "${MIGRATIONS_SCHEMA}"."${MIGRATIONS_TABLE}" order by created_at desc`,
);

const lastApplied = applied[0];
console.log(`\napplied migrations   ${applied.length}`);

let publicTableCount = 0;
try {
  const result = await client.query(
    "select count(*)::int as count from information_schema.tables where table_schema = 'public'",
  );
  publicTableCount = result.rows[0].count;
} catch {
  /* informational only */
}

for (const row of applied) {
  const match = migrations.find(
    (migration) => migration.folderMillis === Number(row.created_at),
  );
  if (match && match.hash !== row.hash) {
    console.log(
      `  ::warning title=Edited migration::${match.folderMillis} was applied, then edited on disk. Its contents no longer match what ran.`,
    );
  }
}

const pending = migrations.filter(
  (migration) =>
    !lastApplied || Number(lastApplied.created_at) < migration.folderMillis,
);

if (applied.length === 0 && publicTableCount > 0) {
  console.log(
    `\n::warning title=Untracked existing schema::The public schema already holds ${publicTableCount} table(s) but drizzle.${MIGRATIONS_TABLE} is empty. This database was likely built with drizzle-kit push, so replaying the migrations will collide with existing objects.`,
  );
}

console.log(`pending migrations   ${pending.length}`);
for (const migration of pending) {
  const entry = journal.entries.find(
    (candidate) => candidate.when === migration.folderMillis,
  );
  console.log(`  - ${entry?.tag} (${migration.sql.length} statements)`);
}

if (pending.length === 0) {
  console.log("\n::notice title=Nothing to do::Database is up to date.");
  await client.end();
  process.exit(0);
}

if (CHECK_ONLY) {
  console.log("\n--check passed: reporting only, nothing applied.");
  await client.end();
  process.exit(0);
}

console.log("\n::group::Applying migrations");
let currentTag = "<unknown>";
let currentStatement = null;
let currentIndex = 0;

await client.query("BEGIN");
try {
  for (const migration of pending) {
    const entry = journal.entries.find(
      (candidate) => candidate.when === migration.folderMillis,
    );
    currentTag = entry?.tag ?? String(migration.folderMillis);
    console.log(`\n-> ${currentTag}`);
    for (const [index, statement] of migration.sql.entries()) {
      const trimmed = statement.trim();
      if (trimmed.length === 0) continue;
      currentStatement = statement;
      currentIndex = index + 1;
      console.log(
        `   [${currentIndex}/${migration.sql.length}] ${trimmed.split("\n")[0].slice(0, 110)}`,
      );
      await client.query(statement);
    }
    currentStatement = null;
    await client.query(
      `insert into "${MIGRATIONS_SCHEMA}"."${MIGRATIONS_TABLE}" ("hash", "created_at") values($1, $2)`,
      [migration.hash, migration.folderMillis],
    );
  }
  await client.query("COMMIT");
  console.log("\n::endgroup::");
  console.log(
    `\n::notice title=Migrations applied::${pending.length} migration(s) applied.`,
  );
  await client.end();
  process.exit(0);
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("::endgroup::");

  const fields = [
    "message",
    "code",
    "detail",
    "hint",
    "position",
    "where",
    "schema",
    "table",
    "column",
    "constraint",
    "dataType",
    "routine",
  ];
  const reported = fields
    .filter((field) => error[field] !== undefined && error[field] !== null)
    .map((field) => `  ${field}: ${error[field]}`)
    .join("\n");

  const location = [
    `  migration: ${currentTag}`,
    currentStatement ? `  statement: #${currentIndex}` : null,
    currentStatement
      ? `\n--- failing SQL ---\n${currentStatement.trim()}\n---------------------`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  fail(
    `${error.message ?? "Unknown error"}`,
    [`${location}\n\n${reported}`, error.stack ? `\n${error.stack}` : ""]
      .filter(Boolean)
      .join("\n"),
  );
}
