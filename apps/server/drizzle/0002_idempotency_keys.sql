-- Stored responses of successful idempotent requests.
--
-- Supports `requireIdempotencyKey()` (src/lib/idempotency/idempotency.middleware.ts),
-- which makes a route replay-safe: the first request claims a key, and any
-- repeat within the retain window replays the stored response instead of
-- re-running the handler.
--
-- The composite primary key is the concurrency primitive. `claimIdempotencyKey`
-- inserts with ON CONFLICT DO NOTHING and lets this constraint arbitrate, so two
-- simultaneous requests cannot both proceed. A select-then-insert would allow
-- both to observe "no row".
--
-- `user_id` is part of the key so one caller cannot replay or probe a key
-- claimed by another.
--
-- Hand-written on purpose: `drizzle:generate` diffs from
-- `meta/0000_snapshot.json`, which has drifted from the live schema and would
-- re-add columns and recreate tables that already exist. See KNOWN_ISSUES.md
-- entry 10.
CREATE TYPE "public"."idempotency_state" AS ENUM('in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"user_id" uuid NOT NULL,
	"key" uuid NOT NULL,
	"scope" varchar(512) NOT NULL,
	"request_hash" varchar(64) NOT NULL,
	"state" "idempotency_state" NOT NULL,
	"response_status" integer,
	"response_body" jsonb,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "idempotency_keys_user_id_key_pk" PRIMARY KEY("user_id","key")
);
--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idempotency_keys_expires_at_idx" ON "idempotency_keys" USING btree ("expires_at");