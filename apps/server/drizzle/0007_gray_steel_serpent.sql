ALTER TABLE "plans" ADD COLUMN "stripe_price_id_annual" varchar(255);--> statement-breakpoint
ALTER TABLE "plans" DROP COLUMN "stripe_price_id_yearly";