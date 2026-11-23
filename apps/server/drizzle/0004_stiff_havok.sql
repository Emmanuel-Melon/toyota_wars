ALTER TABLE "plans" ALTER COLUMN "max_recipients" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "relationship_shipping_addresses" ALTER COLUMN "address_line" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "relationships" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "relationship_shipping_addresses" DROP COLUMN IF EXISTS "street_name";--> statement-breakpoint
ALTER TABLE "relationship_shipping_addresses" DROP COLUMN IF EXISTS "house_number";--> statement-breakpoint
ALTER TABLE "gift_processes" DROP COLUMN IF EXISTS "shipping_street_name";--> statement-breakpoint
ALTER TABLE "gift_processes" DROP COLUMN IF EXISTS "shipping_house_number";--> statement-breakpoint
ALTER TABLE "order_timeline" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;