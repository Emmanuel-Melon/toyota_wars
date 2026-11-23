ALTER TABLE "orders" ADD COLUMN "carrier" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tracking_number" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tracking_url" text;--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_timeline_order_id_created_at_idx" ON "order_timeline" USING btree ("order_id","created_at" DESC NULLS LAST);