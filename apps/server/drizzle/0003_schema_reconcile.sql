-- Reconciles the database with `src/**/*.schema.ts`.
--
-- Symptom: `npm run seed` failed in "Auth System seeding" with
-- `42703 column ... does not exist`, cursor position 257 on the `users`
-- insert — i.e. `"avatar_url"`. The column is declared at
-- `src/feature/users/users.schema.ts:44` but no migration ever created it:
-- `0000_peaceful_archangel.sql` predates the avatar, partner-payout and
-- invite work, and 0001/0002 were hand-written without touching it.
--
-- Adds everything the schema declares that the live database lacks:
--
--   users.avatar_url                                   (users.schema.ts:44)
--   orders.code                                        (orders.schema.ts:52)
--   partner_invites, partner_connected_accounts,
--   partner_transactions, partner_payouts              (partners.schema.ts)
--   5 partner enums                                    (partners.schema.ts:50-78)
--
-- Plus the four `ON DELETE CASCADE` foreign keys the schema declares and
-- the database lacks (see the last section).
--
-- Hand-written on purpose, like 0001 and 0002: `drizzle:generate` diffs from
-- `meta/0000_snapshot.json`, which carries the same drift, and would re-emit
-- everything below *and* `CREATE TABLE idempotency_keys` (already applied by
-- 0002). See KNOWN_ISSUES.md entry 10.
--
-- Every statement is guarded, so this is a no-op on any environment that
-- already has the objects. That matters for production: these objects were
-- verified present once (KNOWN_ISSUES entry 10) and then lost when a
-- database was rebuilt from the migration chain, so it is not knowable from
-- here whether a given deployment has them.
--
-- `orders.code` is added nullable, backfilled, and only then set `NOT NULL`.
-- The schema declares `text("code").notNull().unique()`, but a bare
-- `ADD COLUMN ... NOT NULL` fails on any table that holds rows. Nothing
-- validates the code format in the database or the API — `generateOrderCode()`
-- (`src/feature/orders/orders.utils.ts:71`) mints `ORD-XXXXX-XXXXX`, and no
-- route or serializer exposes `code` yet — so the backfill only needs to be
-- unique and legible.

-- 1. Avatar upload target.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" varchar(2048);
-- --> statement-breakpoint

-- 2. Client-facing order code.
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "code" text;
-- --> statement-breakpoint
UPDATE "orders"
SET "code" = 'ORD-LEGACY-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
WHERE "code" IS NULL;
-- --> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "code" SET NOT NULL;
-- --> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'orders_code_unique'
	) THEN
		ALTER TABLE "orders" ADD CONSTRAINT "orders_code_unique" UNIQUE ("code");
	END IF;
END $$;
-- --> statement-breakpoint

-- 3. Partner payout and invite enums. `CREATE TYPE` has no IF NOT EXISTS, so
-- each one is wrapped to swallow the duplicate-object error.
DO $$
BEGIN
	CREATE TYPE "partner_invite_status" AS ENUM('pending', 'accepted', 'revoked');
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
-- --> statement-breakpoint
DO $$
BEGIN
	CREATE TYPE "connected_account_status" AS ENUM('onboarded', 'pending', 'restricted');
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
-- --> statement-breakpoint
DO $$
BEGIN
	CREATE TYPE "partner_transaction_type" AS ENUM('sale', 'refund');
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
-- --> statement-breakpoint
DO $$
BEGIN
	CREATE TYPE "partner_transaction_status" AS ENUM('pending_transfer', 'transferred', 'refunded', 'failed');
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
-- --> statement-breakpoint
DO $$
BEGIN
	CREATE TYPE "partner_payout_status" AS ENUM('pending', 'in_transit', 'paid', 'failed', 'canceled');
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
-- --> statement-breakpoint

-- 4. Partner staff invites.
CREATE TABLE IF NOT EXISTS "partner_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "partner_member_role" DEFAULT 'staff' NOT NULL,
	"status" "partner_invite_status" DEFAULT 'pending' NOT NULL,
	"accepted_by_user_id" uuid,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_invites_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "partner_invites_accepted_by_user_id_users_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action
);
-- --> statement-breakpoint
CREATE INDEX IF NOT EXISTS "partner_invites_partner_email_idx" ON "partner_invites" USING btree ("partner_id","email");
-- --> statement-breakpoint

-- 5. Stripe Connect onboarding state, one row per partner.
CREATE TABLE IF NOT EXISTS "partner_connected_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"stripe_account_id" varchar(255) NOT NULL,
	"status" "connected_account_status" DEFAULT 'pending' NOT NULL,
	"details_submitted" boolean DEFAULT false NOT NULL,
	"charges_enabled" boolean DEFAULT false NOT NULL,
	"payouts_enabled" boolean DEFAULT false NOT NULL,
	"payout_currency" varchar(3),
	"onboarding_started_at" timestamp,
	"onboarding_completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_connected_accounts_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action
);
-- --> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "partner_connected_accounts_partner_idx" ON "partner_connected_accounts" USING btree ("partner_id");
-- --> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "partner_connected_accounts_stripe_idx" ON "partner_connected_accounts" USING btree ("stripe_account_id");
-- --> statement-breakpoint

-- 6. Per-sale ledger. `voucher_order_id` and `gift_process_id` are plain uuids:
-- the schema declares no reference for them, so neither does this.
CREATE TABLE IF NOT EXISTS "partner_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"voucher_order_id" uuid,
	"gift_process_id" uuid,
	"user_id" uuid,
	"stripe_payment_intent_id" varchar(255),
	"stripe_transfer_id" varchar(255),
	"stripe_refund_id" varchar(255),
	"type" "partner_transaction_type" NOT NULL,
	"status" "partner_transaction_status" DEFAULT 'pending_transfer' NOT NULL,
	"gross_amount_cents" integer NOT NULL,
	"platform_fee_cents" integer NOT NULL,
	"net_amount_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'eur' NOT NULL,
	"correlation_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_transactions_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "partner_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action
);
-- --> statement-breakpoint
CREATE INDEX IF NOT EXISTS "partner_transactions_partner_idx" ON "partner_transactions" USING btree ("partner_id");
-- --> statement-breakpoint
CREATE INDEX IF NOT EXISTS "partner_transactions_payment_intent_idx" ON "partner_transactions" USING btree ("stripe_payment_intent_id");
-- --> statement-breakpoint
CREATE INDEX IF NOT EXISTS "partner_transactions_transfer_idx" ON "partner_transactions" USING btree ("stripe_transfer_id");
-- --> statement-breakpoint
CREATE INDEX IF NOT EXISTS "partner_transactions_refund_idx" ON "partner_transactions" USING btree ("stripe_refund_id");
-- --> statement-breakpoint

-- 7. Stripe Connect payouts.
CREATE TABLE IF NOT EXISTS "partner_payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"stripe_payout_id" varchar(255) NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'eur' NOT NULL,
	"status" "partner_payout_status" DEFAULT 'pending' NOT NULL,
	"arrival_date" timestamp,
	"failure_code" varchar(255),
	"failure_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_payouts_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action
);
-- --> statement-breakpoint
CREATE INDEX IF NOT EXISTS "partner_payouts_partner_idx" ON "partner_payouts" USING btree ("partner_id");
-- --> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "partner_payouts_stripe_idx" ON "partner_payouts" USING btree ("stripe_payout_id");
-- --> statement-breakpoint

-- 8. Foreign keys the schema declares with `onDelete: "cascade"` and the
-- database carries as `NO ACTION`. These are the only four that differ, and
-- this is a behaviour change: deleting an occasion now cascades to
-- `decisions` and `gift_processes` rows, and deleting a process cascades to
-- its decisions and gift suggestions.
ALTER TABLE "decisions" DROP CONSTRAINT IF EXISTS "decisions_occasion_id_occasions_id_fk";
-- --> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_occasion_id_occasions_id_fk" FOREIGN KEY ("occasion_id") REFERENCES "public"."occasions"("id") ON DELETE cascade ON UPDATE no action;
-- --> statement-breakpoint
ALTER TABLE "decisions" DROP CONSTRAINT IF EXISTS "decisions_process_id_gift_processes_id_fk";
-- --> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_process_id_gift_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."gift_processes"("id") ON DELETE cascade ON UPDATE no action;
-- --> statement-breakpoint
ALTER TABLE "gift_suggestions" DROP CONSTRAINT IF EXISTS "gift_suggestions_process_id_gift_processes_id_fk";
-- --> statement-breakpoint
ALTER TABLE "gift_suggestions" ADD CONSTRAINT "gift_suggestions_process_id_gift_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."gift_processes"("id") ON DELETE cascade ON UPDATE no action;
-- --> statement-breakpoint
ALTER TABLE "gift_processes" DROP CONSTRAINT IF EXISTS "gift_processes_occasion_id_occasions_id_fk";
-- --> statement-breakpoint
ALTER TABLE "gift_processes" ADD CONSTRAINT "gift_processes_occasion_id_occasions_id_fk" FOREIGN KEY ("occasion_id") REFERENCES "public"."occasions"("id") ON DELETE cascade ON UPDATE no action;
