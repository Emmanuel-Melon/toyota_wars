-- Remove Stripe-backed commerce features: payments, orders, plans,
-- subscriptions, vouchers and Stripe Connect partner ledger data.

DROP TABLE IF EXISTS "public"."webhook_events" CASCADE;
DROP TABLE IF EXISTS "public"."refunds" CASCADE;
DROP TABLE IF EXISTS "public"."transactions" CASCADE;
DROP TABLE IF EXISTS "public"."order_timeline" CASCADE;
DROP TABLE IF EXISTS "public"."order_items" CASCADE;
DROP TABLE IF EXISTS "public"."orders" CASCADE;
DROP TABLE IF EXISTS "public"."subscription_reminders" CASCADE;
DROP TABLE IF EXISTS "public"."subscription_periods" CASCADE;
DROP TABLE IF EXISTS "public"."subscriptions" CASCADE;
DROP TABLE IF EXISTS "public"."plans" CASCADE;
DROP TABLE IF EXISTS "public"."redemption_events" CASCADE;
DROP TABLE IF EXISTS "public"."intent_voucher_mapping" CASCADE;
DROP TABLE IF EXISTS "public"."voucher_orders" CASCADE;
DROP TABLE IF EXISTS "public"."voucher_product_classification" CASCADE;
DROP TABLE IF EXISTS "public"."voucher_products" CASCADE;
DROP TABLE IF EXISTS "public"."voucher_categories" CASCADE;
DROP TABLE IF EXISTS "public"."vouchers" CASCADE;
DROP TABLE IF EXISTS "public"."partner_payouts" CASCADE;
DROP TABLE IF EXISTS "public"."partner_transactions" CASCADE;
DROP TABLE IF EXISTS "public"."partner_connected_accounts" CASCADE;

ALTER TABLE "public"."users" DROP COLUMN IF EXISTS "stripe_customer_id";
ALTER TABLE "public"."users" DROP COLUMN IF EXISTS "stripe_account_id";
ALTER TABLE "public"."gift_processes" DROP COLUMN IF EXISTS "selected_voucher_id";
ALTER TABLE "public"."gift_processes" DROP COLUMN IF EXISTS "selected_voucher_value_cents";
ALTER TABLE "public"."gift_processes" DROP COLUMN IF EXISTS "voucher_required";

DROP TYPE IF EXISTS "public"."billing_cycle" CASCADE;
DROP TYPE IF EXISTS "public"."plan_tier" CASCADE;
DROP TYPE IF EXISTS "public"."subscription_status" CASCADE;
DROP TYPE IF EXISTS "public"."subscription_reminder_type" CASCADE;
DROP TYPE IF EXISTS "public"."fulfillment_status" CASCADE;
DROP TYPE IF EXISTS "public"."order_status" CASCADE;
DROP TYPE IF EXISTS "public"."order_item_type" CASCADE;
DROP TYPE IF EXISTS "public"."refund_status" CASCADE;
DROP TYPE IF EXISTS "public"."refund_initiated_by" CASCADE;
DROP TYPE IF EXISTS "public"."refund_order_type" CASCADE;
DROP TYPE IF EXISTS "public"."transaction_status" CASCADE;
DROP TYPE IF EXISTS "public"."transaction_type" CASCADE;
DROP TYPE IF EXISTS "public"."voucher_status" CASCADE;
DROP TYPE IF EXISTS "public"."voucher_category_type" CASCADE;
DROP TYPE IF EXISTS "public"."voucher_order_state" CASCADE;
DROP TYPE IF EXISTS "public"."connected_account_status" CASCADE;
DROP TYPE IF EXISTS "public"."partner_payout_status" CASCADE;
DROP TYPE IF EXISTS "public"."partner_transaction_status" CASCADE;
DROP TYPE IF EXISTS "public"."partner_transaction_type" CASCADE;
