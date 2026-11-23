-- Adds configurable custom voucher values to gift processes.
--
-- `selected_voucher_value_cents` stores the user's chosen voucher value in
-- cents, independent of the legacy preset rows in `voucher_products`.
-- Legacy preset selections are backfilled from their product value so existing
-- processes keep a readable value without changing their behaviour.

-- 1. Store the selected voucher value in cents.
ALTER TABLE "gift_processes" ADD COLUMN IF NOT EXISTS "selected_voucher_value_cents" integer;
-- --> statement-breakpoint

-- 2. Backfill legacy preset selections from their voucher product value.
UPDATE "gift_processes" p
SET "selected_voucher_value_cents" = vp."value_cents"
FROM "voucher_products" vp
WHERE p."selected_voucher_id" = vp."id"
  AND p."selected_voucher_value_cents" IS NULL;
-- --> statement-breakpoint
