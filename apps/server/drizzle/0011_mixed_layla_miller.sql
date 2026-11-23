ALTER TABLE "gift_processes" ADD COLUMN "selected_voucher_value_cents" integer;--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at" DESC NULLS LAST);