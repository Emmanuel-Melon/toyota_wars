INSERT INTO "plans" ("tier", "name", "price_monthly", "price_yearly", "lead_time", "created_at")
SELECT 'free', 'Free', 0, 0, 14, now()
WHERE EXISTS (SELECT 1 FROM "plans" WHERE "tier" IN ('beginner', 'medium', 'family'))
  AND NOT EXISTS (SELECT 1 FROM "plans" WHERE "tier" = 'free');--> statement-breakpoint
UPDATE "subscriptions" SET "plan_id" = (SELECT "id" FROM "plans" WHERE "tier" = 'free')
WHERE "plan_id" IN (SELECT "id" FROM "plans" WHERE "tier" IN ('beginner', 'medium', 'family'));--> statement-breakpoint
UPDATE "subscription_periods" SET "plan_id" = (SELECT "id" FROM "plans" WHERE "tier" = 'free')
WHERE "plan_id" IN (SELECT "id" FROM "plans" WHERE "tier" IN ('beginner', 'medium', 'family'));--> statement-breakpoint
DELETE FROM "plans" WHERE "tier" IN ('beginner', 'medium', 'family');--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "tier" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."plan_tier";--> statement-breakpoint
CREATE TYPE "public"."plan_tier" AS ENUM('free', 'ivyi_care');--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "tier" SET DATA TYPE "public"."plan_tier" USING "tier"::"public"."plan_tier";
