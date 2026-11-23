CREATE TYPE "public"."coverage_cluster_status" AS ENUM('draft', 'live', 'paused');--> statement-breakpoint
CREATE TYPE "public"."invite_status" AS ENUM('pending', 'accepted', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."classifier_question_type" AS ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'SCALE', 'BOOLEAN');--> statement-breakpoint
CREATE TYPE "public"."classifier_scope" AS ENUM('RELATIONSHIP', 'OCCASION', 'PROCESS');--> statement-breakpoint
CREATE TYPE "public"."decision_type" AS ENUM('INQUIRY', 'SELECTION', 'OPERATIONAL', 'INTENT');--> statement-breakpoint
CREATE TYPE "public"."intensity_level" AS ENUM('light', 'noticeable', 'deep');--> statement-breakpoint
CREATE TYPE "public"."proximity_level" AS ENUM('A', 'B', 'C');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('in_app', 'email', 'push');--> statement-breakpoint
CREATE TYPE "public"."notification_failure_reason" AS ENUM('provider_error', 'invalid_target', 'rejected', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('notification_pending', 'notification_sent', 'notification_delivered', 'notification_opened', 'notification_failed');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('admin', 'auth', 'decisions', 'gifting', 'occasions', 'options', 'orders', 'partners', 'payments', 'plans', 'relationships', 'system', 'vouchers', 'users');--> statement-breakpoint
CREATE TYPE "public"."recipient_type" AS ENUM('sender', 'fulfillment_partner', 'admin');--> statement-breakpoint
CREATE TYPE "public"."occasion_reminder_status" AS ENUM('scheduled', 'sent', 'failed', 'snoozed', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."occasion_reminder_type" AS ENUM('initial', 'decision_warning', 'final_alert');--> statement-breakpoint
CREATE TYPE "public"."occasion_status" AS ENUM('created', 'upcoming', 'active', 'passed');--> statement-breakpoint
CREATE TYPE "public"."recurrence_type" AS ENUM('none', 'daily', 'weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_status" AS ENUM('sent_to_fulfillment', 'confirmed', 'shipped', 'delivered', 'completed', 'hold', 'failed', 'cancelled', 'missed');--> statement-breakpoint
CREATE TYPE "public"."order_item_type" AS ENUM('GIFT_KIT', 'VOUCHER', 'SERVICE_FEE', 'SHIPPING_FEE');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."coverage" AS ENUM('none', 'low', 'high');--> statement-breakpoint
CREATE TYPE "public"."energy_level" AS ENUM('active', 'calm', 'none');--> statement-breakpoint
CREATE TYPE "public"."partner_member_role" AS ENUM('owner', 'staff');--> statement-breakpoint
CREATE TYPE "public"."partner_member_status" AS ENUM('active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."partner_status" AS ENUM('pending', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."social_mode" AS ENUM('solo', 'duo', 'social');--> statement-breakpoint
CREATE TYPE "public"."terminal_status" AS ENUM('active', 'locked', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."refund_initiated_by" AS ENUM('system', 'admin', 'support');--> statement-breakpoint
CREATE TYPE "public"."refund_order_type" AS ENUM('platform', 'voucher');--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('pending', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('processing', 'succeeded', 'failed', 'refunded', 'pending');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('initial', 'renewal', 'upgrade', 'refund', 'one_time');--> statement-breakpoint
CREATE TYPE "public"."billing_cycle" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."plan_tier" AS ENUM('free', 'beginner', 'medium', 'family');--> statement-breakpoint
CREATE TYPE "public"."subscription_reminder_type" AS ENUM('renewal_upcoming', 'payment_failed', 'grace_period_ending');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'paused', 'trialing', 'unpaid');--> statement-breakpoint
CREATE TYPE "public"."stock_status" AS ENUM('in_stock', 'low_stock', 'out_of_stock', 'discontinued');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user', 'partner');--> statement-breakpoint
CREATE TYPE "public"."voucher_category_type" AS ENUM('wellness', 'dining', 'activity');--> statement-breakpoint
CREATE TYPE "public"."voucher_order_state" AS ENUM('draft', 'paid', 'vouchers_issued', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."voucher_status" AS ENUM('active', 'operational_expired', 'legal_expired', 'exhausted', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."secure_token_event_type" AS ENUM('VIEWED', 'VALIDATED', 'CONSUMED', 'REVOKED', 'EXPIRED_ATTEMPT', 'INVALID_ATTEMPT');--> statement-breakpoint
CREATE TYPE "public"."secure_token_type" AS ENUM('CODE', 'LINK');--> statement-breakpoint
CREATE TYPE "public"."gift_detection_status" AS ENUM('OCCASION_DETECTED', 'DECISION_WINDOW_OPEN');--> statement-breakpoint
CREATE TYPE "public"."gift_entry_mode" AS ENUM('occasion_guided', 'direct');--> statement-breakpoint
CREATE TYPE "public"."gift_outcome" AS ENUM('SET_AND_VOUCHER', 'SET_ONLY', 'VOUCHER_ONLY');--> statement-breakpoint
CREATE TYPE "public"."gift_process_status" AS ENUM('PROCESS_CREATED', 'CLASSIFICATION_STARTED', 'CLASSIFICATION_COMPLETED', 'VARIANT_SELECTED', 'TONE_SELECTED', 'GIFT_SET_SELECTED', 'INTENT_RESOLVED', 'PARTNER_SELECTED', 'VOUCHER_SELECTED', 'SHIPPING_ADDRESS_ADDED', 'READY_FOR_CHECKOUT', 'PREPARING_ORDER', 'READY_FOR_FULFILLMENT', 'ORDER_CONFIRMED', 'SENT_TO_FULFILLMENT', 'IN_FULFILLMENT', 'SHIPPED', 'ON_HOLD', 'AWAITING_VOUCHER_PAYMENT_RECOVERY', 'VOUCHER_REFUND_PENDING', 'DELIVERED', 'COMPLETED', 'REFUNDED', 'FAILED', 'CANCELLED', 'SUPERSEDED', 'MISSED');--> statement-breakpoint
CREATE TYPE "public"."gift_process_step" AS ENUM('CLASSIFICATION', 'AWAITING_VARIANT_SELECTION', 'AWAITING_TONE_SELECTION', 'AWAITING_PARTNER_SELECTION', 'AWAITING_VOUCHER_VALUE', 'AWAITING_SHIPPING_ADDRESS', 'ORDER_REVIEW', 'AWAITING_CHECKOUT', 'AWAITING_VOUCHER_PAYMENT_RECOVERY');--> statement-breakpoint
CREATE TYPE "public"."gift_relationship_depth" AS ENUM('FORMAL', 'FAMILIAR', 'VERY_CLOSE');--> statement-breakpoint
CREATE TYPE "public"."gift_risk_exclusion" AS ENUM('NO_HUMOR', 'NO_DECORATION', 'NO_BODY_RELATED', 'NO_TECH');--> statement-breakpoint
CREATE TYPE "public"."gift_signal_intensity" AS ENUM('LIGHT', 'NOTICEABLE', 'QUIET_AND_DEEP');--> statement-breakpoint
CREATE TYPE "public"."selected_tone_code" AS ENUM('A', 'B', 'C');--> statement-breakpoint
CREATE TABLE "coverage_cluster_partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cluster_id" uuid NOT NULL,
	"partner_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coverage_cluster_postal_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cluster_id" uuid NOT NULL,
	"postal_code" varchar(5) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coverage_clusters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" "coverage_cluster_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation_processing_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_id" uuid NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" varchar(50) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"status" "invite_status" DEFAULT 'pending' NOT NULL,
	"accepted_by_user_id" uuid,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "allowed_emails" (
	"email" text PRIMARY KEY NOT NULL,
	"added_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"refresh_token_hash" varchar(255),
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gift_classifier_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"label" text NOT NULL,
	"mapped_intent_id" uuid,
	"mapped_relationship_depth" "gift_relationship_depth",
	"mapped_signal_intensity" "gift_signal_intensity",
	"triggers_stage" text,
	"weight" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "gift_classifier_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"prompt" text NOT NULL,
	"step" text NOT NULL,
	"type" "classifier_question_type" NOT NULL,
	"scope" "classifier_scope",
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"occasion_id" uuid NOT NULL,
	"relationship_id" uuid,
	"process_id" uuid,
	"decision_type" "decision_type" NOT NULL,
	"decision_key" text NOT NULL,
	"decision_value" text NOT NULL,
	"resolved_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gift_intents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gift_set_templates" (
	"set_id" uuid PRIMARY KEY NOT NULL,
	"item_id" uuid NOT NULL,
	"proximity" "proximity_level" NOT NULL,
	"label" text NOT NULL,
	"rationale" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gift_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"intent_id" uuid NOT NULL,
	"intensity" "intensity_level" NOT NULL,
	"label" text NOT NULL,
	"price_in_cents" integer NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"set_id" uuid NOT NULL,
	"label" varchar(255) NOT NULL,
	"variant_id" uuid NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"recipient_email" varchar(255),
	"type" varchar(100) NOT NULL,
	"channel" "notification_channel" DEFAULT 'in_app' NOT NULL,
	"recipient_type" "recipient_type" DEFAULT 'sender' NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"action_url" text,
	"occasion_id" text,
	"process_id" text,
	"scheduled_at" timestamp NOT NULL,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"status" "notification_status" DEFAULT 'notification_pending' NOT NULL,
	"failure_reason" "notification_failure_reason",
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"template_key" varchar(100),
	"entity_id" varchar(255),
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"is_actioned" boolean DEFAULT false NOT NULL,
	"actioned_at" timestamp,
	CONSTRAINT "notifications_recipient_present_check" CHECK ("notifications"."user_id" IS NOT NULL OR "notifications"."recipient_email" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"keys" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "user_notification_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"category" varchar,
	"email_enabled" boolean DEFAULT true,
	"push_enabled" boolean DEFAULT true,
	"in_app_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "occasion_participants" (
	"occasion_id" uuid NOT NULL,
	"user_id" uuid,
	"relationship_id" uuid,
	"email" text,
	"joined_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "occasion_participants_occasion_id_email_unique" UNIQUE("occasion_id","email")
);
--> statement-breakpoint
CREATE TABLE "occasion_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occasion_instance_id" uuid NOT NULL,
	"reminder_type" "occasion_reminder_type" NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"sent_at" timestamp,
	"status" "occasion_reminder_status" DEFAULT 'scheduled' NOT NULL,
	"delivery_attempts" integer DEFAULT 0,
	"max_delivery_attempts" integer DEFAULT 3,
	"last_delivery_attempt" timestamp,
	"delivery_failure_reason" text,
	"user_snooze_until" timestamp,
	"user_disabled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "occasions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"date" timestamp NOT NULL,
	"recurrence_type" "recurrence_type" DEFAULT 'none' NOT NULL,
	"recurrence_interval" text,
	"parent_id" uuid,
	"organizer_id" uuid NOT NULL,
	"status" "occasion_status" DEFAULT 'created' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gift_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"process_id" uuid NOT NULL,
	"gift_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"type" "order_item_type" NOT NULL,
	"price_cents" integer NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "order_timeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"process_id" uuid NOT NULL,
	"from_status" "fulfillment_status",
	"to_status" "fulfillment_status",
	"actor" varchar(100) NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"process_id" uuid NOT NULL,
	"total_amount_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'eur' NOT NULL,
	"stripe_session_id" varchar(255),
	"stripe_payment_intent_id" varchar(255),
	"paid_at" timestamp,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"fulfillment_status" "fulfillment_status",
	"delivery_snapshot" jsonb,
	"fulfillment_export" jsonb,
	"planned_delivery_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "partner_terminal_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"terminal_id" uuid NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "partner_terminals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_user_id" uuid NOT NULL,
	"device_token" varchar(255) NOT NULL,
	"label" varchar(100),
	"status" "terminal_status" DEFAULT 'active' NOT NULL,
	"last_seen_at" timestamp,
	"locked_at" timestamp,
	"locked_by_admin_id" uuid,
	"revoked_at" timestamp,
	"revoked_by_admin_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_terminals_device_token_unique" UNIQUE("device_token")
);
--> statement-breakpoint
CREATE TABLE "partner_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "partner_member_role" DEFAULT 'staff' NOT NULL,
	"status" "partner_member_status" DEFAULT 'active' NOT NULL,
	"suspended_at" timestamp,
	"suspended_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"partner_id" uuid NOT NULL,
	"target_coverage" "coverage" DEFAULT 'high' NOT NULL,
	"is_notified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"notified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" varchar(50),
	"name" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"voucher_type" varchar(100) NOT NULL,
	"city" varchar(255) NOT NULL,
	"postal_code" varchar(5) NOT NULL,
	"country_code" varchar(2) DEFAULT 'DE' NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"energy_level" "energy_level",
	"social_mode" "social_mode",
	"coverage" "coverage" DEFAULT 'high' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"source" varchar(50) DEFAULT 'manual',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "partners_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_type" "refund_order_type" NOT NULL,
	"order_id" uuid,
	"process_id" uuid,
	"user_id" uuid,
	"amount_cents" integer NOT NULL,
	"reason" text,
	"status" "refund_status" DEFAULT 'pending' NOT NULL,
	"stripe_refund_id" varchar(255),
	"initiated_by" "refund_initiated_by" NOT NULL,
	"actor_id" uuid,
	"correlation_id" varchar(255),
	"refunded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"type" varchar(255) NOT NULL,
	"payload" json NOT NULL,
	"failed" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"subscription_id" uuid,
	"stripe_invoice_id" varchar(255),
	"stripe_payment_intent_id" varchar(255),
	"stripe_customer_id" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(10) NOT NULL,
	"status" "transaction_status" NOT NULL,
	"type" "transaction_type" NOT NULL,
	"failure_reason" varchar(500),
	"correlation_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" "plan_tier" NOT NULL,
	"name" varchar(255) NOT NULL,
	"price_monthly" integer NOT NULL,
	"stripe_price_id_monthly" varchar(255),
	"price_yearly" integer NOT NULL,
	"stripe_price_id_yearly" varchar(255),
	"max_recipients" integer NOT NULL,
	"lead_time" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plans_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
CREATE TABLE "subscription_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"billing_cycle" "billing_cycle" NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"amount" integer NOT NULL,
	"stripe_invoice_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"type" "subscription_reminder_type" NOT NULL,
	"period_end" timestamp NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"stripe_subscription_id" varchar(255),
	"billing_cycle" "billing_cycle" DEFAULT 'yearly',
	"stripe_customer_id" varchar(255),
	"status" "subscription_status" NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"paused_at" timestamp,
	"pause_resumes_at" timestamp,
	"canceled_at" timestamp,
	"grace_period_ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"checkout_snapshot" jsonb,
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "partner_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"price" numeric(10, 2),
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 10 NOT NULL,
	"stock_status" "stock_status" DEFAULT 'in_stock' NOT NULL,
	"available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_products_partner_id_product_id_unique" UNIQUE("partner_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "product_intent_weights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"weight" numeric(5, 4) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "weight_range" CHECK (weight >= 0 AND weight <= 1)
);
--> statement-breakpoint
CREATE TABLE "product_relationship_depth_weights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"relationship_depth" "gift_relationship_depth" NOT NULL,
	"weight" numeric(5, 4) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_relationship_depth_weights_product_id_relationship_depth_unique" UNIQUE("product_id","relationship_depth"),
	CONSTRAINT "weight_range" CHECK (weight >= 0 AND weight <= 1)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"sku" varchar(100) NOT NULL,
	"category_id" uuid NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"image_url" text,
	"bestseller_rank" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "relationship_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"relationship_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answer_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationship_proximity_map" (
	"relationship_type" text PRIMARY KEY NOT NULL,
	"proximity" "proximity_level" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationship_shipping_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"relationship_id" uuid,
	"address_line" varchar(255) NOT NULL,
	"postal_code" varchar(10) NOT NULL,
	"city" varchar(100) NOT NULL,
	"country_code" varchar(2) DEFAULT 'DE' NOT NULL,
	"notes" text,
	"is_default" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "relationship_shipping_addresses_relationship_id_unique" UNIQUE("relationship_id")
);
--> statement-breakpoint
CREATE TABLE "relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"related_user_id" uuid,
	"email" text NOT NULL,
	"nickname" text,
	"first_name" text,
	"last_name" text,
	"relationship_type" text DEFAULT 'Friend' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"needs_refinement" boolean DEFAULT false NOT NULL,
	"quiz_completed_at" timestamp,
	CONSTRAINT "relationships_user_id_email_unique" UNIQUE("user_id","email")
);
--> statement-breakpoint
CREATE TABLE "user_onboarding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255),
	"preferred_name" varchar(255),
	"dob" date NOT NULL,
	"country" varchar(100) NOT NULL,
	"city" varchar(100),
	"preferred_language" varchar(50) DEFAULT 'en' NOT NULL,
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"gifting_statements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_onboarding_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"label" varchar(100),
	"address_line" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"postal_code" varchar(5) NOT NULL,
	"country_code" varchar(2) DEFAULT 'DE' NOT NULL,
	"notes" text,
	"is_default" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"email_verified_at" timestamp,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"preferred_name" varchar(255),
	"email" varchar(255),
	"password" varchar(255),
	"dob" date,
	"country" varchar(255),
	"city" varchar(255),
	"preferred_language" varchar(50) DEFAULT 'en' NOT NULL,
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"gifting_statements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_account_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_first_login" boolean DEFAULT true NOT NULL,
	"is_onboarded" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "intent_voucher_mapping" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"intent_id" varchar(255) NOT NULL,
	"voucher_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"category" "voucher_category_type" NOT NULL,
	"fallback_category" "voucher_category_type"
);
--> statement-breakpoint
CREATE TABLE "redemption_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"voucher_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"partner_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "voucher_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "voucher_category_type" NOT NULL,
	"description" text,
	CONSTRAINT "voucher_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "voucher_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"voucher_product_id" uuid,
	"partner_id" uuid NOT NULL,
	"gift_process_id" uuid NOT NULL,
	"order_item_id" uuid,
	"state" "voucher_order_state" DEFAULT 'draft' NOT NULL,
	"currency" varchar(3) DEFAULT 'eur' NOT NULL,
	"expected_total_cents" integer NOT NULL,
	"hold_reason" text,
	"hold_details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"set_id" uuid,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "voucher_product_classification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"energy_level" "energy_level" DEFAULT 'none' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voucher_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"value_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'eur' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"stripe_price_id" varchar(255),
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "vouchers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"claim_code" text NOT NULL,
	"voucher_order_id" uuid NOT NULL,
	"partner_id" uuid NOT NULL,
	"face_value_cents" integer NOT NULL,
	"remaining_cents" integer NOT NULL,
	"status" "voucher_status" DEFAULT 'active' NOT NULL,
	"storage_key" text,
	"operational_expires_at" timestamp with time zone NOT NULL,
	"legal_expires_at" timestamp with time zone NOT NULL,
	"sequence" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	CONSTRAINT "vouchers_claim_code_unique" UNIQUE("claim_code"),
	CONSTRAINT "chk_vouchers_remaining_bounds" CHECK ("vouchers"."remaining_cents" >= 0 AND "vouchers"."remaining_cents" <= "vouchers"."face_value_cents")
);
--> statement-breakpoint
CREATE TABLE "secure_token_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_id" uuid,
	"event_type" "secure_token_event_type" NOT NULL,
	"ip_address" varchar(45),
	"user_agent" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "secure_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"token_type" "secure_token_type" NOT NULL,
	"user_id" uuid,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"max_uses" integer,
	"uses_count" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gift_process_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gift_process_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answer_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"is_system_generated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gift_process_risk_exclusions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gift_process_id" uuid NOT NULL,
	"exclusion" "gift_risk_exclusion" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gift_processes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_process_id" uuid,
	"superseded_by_process_id" uuid,
	"user_id" uuid NOT NULL,
	"name" varchar(255),
	"occasion_id" uuid,
	"entry_mode" "gift_entry_mode" DEFAULT 'occasion_guided' NOT NULL,
	"status" "gift_process_status" DEFAULT 'PROCESS_CREATED',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"recipient_id" uuid NOT NULL,
	"relationship_id" uuid NOT NULL,
	"resolved_intent_id" uuid,
	"selected_set_id" uuid,
	"selected_variant_id" uuid,
	"partner_id" uuid,
	"selected_voucher_id" uuid,
	"variant_required" boolean DEFAULT true NOT NULL,
	"voucher_required" boolean DEFAULT true NOT NULL,
	"outcome" "gift_outcome",
	"detection_status" "gift_detection_status",
	"current_step" "gift_process_step" DEFAULT 'CLASSIFICATION',
	"selected_tone_code" "selected_tone_code",
	"tone_recommendation_src" text,
	"tone_last_changed_at" timestamp,
	"tone_locked" boolean DEFAULT false NOT NULL,
	"checkout_snapshot" jsonb,
	"tone_options_snapshot" jsonb,
	"shipping_snapshot" jsonb,
	"shipping_address_line" varchar(255),
	"shipping_postal_code" varchar(10),
	"shipping_city" varchar(100),
	"shipping_country_code" varchar(2) DEFAULT 'DE',
	"shipping_notes" text
);
--> statement-breakpoint
ALTER TABLE "coverage_cluster_partners" ADD CONSTRAINT "coverage_cluster_partners_cluster_id_coverage_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."coverage_clusters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverage_cluster_partners" ADD CONSTRAINT "coverage_cluster_partners_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverage_cluster_postal_codes" ADD CONSTRAINT "coverage_cluster_postal_codes_cluster_id_coverage_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."coverage_clusters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_processing_log" ADD CONSTRAINT "invitation_processing_log_invite_id_user_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."user_invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation_processing_log" ADD CONSTRAINT "invitation_processing_log_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_invites" ADD CONSTRAINT "user_invites_accepted_by_user_id_users_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_events" ADD CONSTRAINT "auth_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_classifier_answers" ADD CONSTRAINT "gift_classifier_answers_question_id_gift_classifier_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."gift_classifier_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_classifier_answers" ADD CONSTRAINT "gift_classifier_answers_mapped_intent_id_gift_intents_id_fk" FOREIGN KEY ("mapped_intent_id") REFERENCES "public"."gift_intents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_classifier_answers" ADD CONSTRAINT "gift_classifier_answers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_classifier_answers" ADD CONSTRAINT "gift_classifier_answers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_classifier_questions" ADD CONSTRAINT "gift_classifier_questions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_classifier_questions" ADD CONSTRAINT "gift_classifier_questions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_occasion_id_occasions_id_fk" FOREIGN KEY ("occasion_id") REFERENCES "public"."occasions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_relationship_id_relationships_id_fk" FOREIGN KEY ("relationship_id") REFERENCES "public"."relationships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_process_id_gift_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."gift_processes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_set_templates" ADD CONSTRAINT "gift_set_templates_item_id_gift_intents_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."gift_intents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_variants" ADD CONSTRAINT "gift_variants_intent_id_gift_intents_id_fk" FOREIGN KEY ("intent_id") REFERENCES "public"."gift_intents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_set_id_gift_set_templates_set_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."gift_set_templates"("set_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_variant_id_gift_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."gift_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occasion_participants" ADD CONSTRAINT "occasion_participants_occasion_id_occasions_id_fk" FOREIGN KEY ("occasion_id") REFERENCES "public"."occasions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occasion_participants" ADD CONSTRAINT "occasion_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occasion_participants" ADD CONSTRAINT "occasion_participants_relationship_id_relationships_id_fk" FOREIGN KEY ("relationship_id") REFERENCES "public"."relationships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occasion_reminders" ADD CONSTRAINT "occasion_reminders_occasion_instance_id_occasions_id_fk" FOREIGN KEY ("occasion_instance_id") REFERENCES "public"."occasions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_suggestions" ADD CONSTRAINT "gift_suggestions_process_id_gift_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."gift_processes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_suggestions" ADD CONSTRAINT "gift_suggestions_gift_id_gifts_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."gifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_timeline" ADD CONSTRAINT "order_timeline_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_timeline" ADD CONSTRAINT "order_timeline_process_id_gift_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."gift_processes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_process_id_gift_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."gift_processes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_terminal_sessions" ADD CONSTRAINT "partner_terminal_sessions_terminal_id_partner_terminals_id_fk" FOREIGN KEY ("terminal_id") REFERENCES "public"."partner_terminals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_terminals" ADD CONSTRAINT "partner_terminals_partner_user_id_partner_users_id_fk" FOREIGN KEY ("partner_user_id") REFERENCES "public"."partner_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_terminals" ADD CONSTRAINT "partner_terminals_locked_by_admin_id_users_id_fk" FOREIGN KEY ("locked_by_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_terminals" ADD CONSTRAINT "partner_terminals_revoked_by_admin_id_users_id_fk" FOREIGN KEY ("revoked_by_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_users" ADD CONSTRAINT "partner_users_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_users" ADD CONSTRAINT "partner_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_waitlist" ADD CONSTRAINT "partner_waitlist_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partners" ADD CONSTRAINT "partners_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partners" ADD CONSTRAINT "partners_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_periods" ADD CONSTRAINT "subscription_periods_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_periods" ADD CONSTRAINT "subscription_periods_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_reminders" ADD CONSTRAINT "subscription_reminders_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_products" ADD CONSTRAINT "partner_products_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_products" ADD CONSTRAINT "partner_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_intent_weights" ADD CONSTRAINT "product_intent_weights_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_relationship_depth_weights" ADD CONSTRAINT "product_relationship_depth_weights_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship_answers" ADD CONSTRAINT "relationship_answers_relationship_id_relationships_id_fk" FOREIGN KEY ("relationship_id") REFERENCES "public"."relationships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship_answers" ADD CONSTRAINT "relationship_answers_question_id_gift_classifier_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."gift_classifier_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship_answers" ADD CONSTRAINT "relationship_answers_answer_id_gift_classifier_answers_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."gift_classifier_answers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship_answers" ADD CONSTRAINT "relationship_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationship_shipping_addresses" ADD CONSTRAINT "relationship_shipping_addresses_relationship_id_relationships_id_fk" FOREIGN KEY ("relationship_id") REFERENCES "public"."relationships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_related_user_id_users_id_fk" FOREIGN KEY ("related_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_relationship_type_relationship_proximity_map_relationship_type_fk" FOREIGN KEY ("relationship_type") REFERENCES "public"."relationship_proximity_map"("relationship_type") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD CONSTRAINT "user_onboarding_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intent_voucher_mapping" ADD CONSTRAINT "intent_voucher_mapping_voucher_id_vouchers_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."vouchers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemption_events" ADD CONSTRAINT "redemption_events_voucher_id_vouchers_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."vouchers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemption_events" ADD CONSTRAINT "redemption_events_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemption_events" ADD CONSTRAINT "redemption_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemption_events" ADD CONSTRAINT "redemption_events_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_orders" ADD CONSTRAINT "voucher_orders_voucher_product_id_voucher_products_id_fk" FOREIGN KEY ("voucher_product_id") REFERENCES "public"."voucher_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_orders" ADD CONSTRAINT "voucher_orders_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_orders" ADD CONSTRAINT "voucher_orders_gift_process_id_gift_processes_id_fk" FOREIGN KEY ("gift_process_id") REFERENCES "public"."gift_processes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_orders" ADD CONSTRAINT "voucher_orders_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_orders" ADD CONSTRAINT "voucher_orders_set_id_partners_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_orders" ADD CONSTRAINT "voucher_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_orders" ADD CONSTRAINT "voucher_orders_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_product_classification" ADD CONSTRAINT "voucher_product_classification_product_id_voucher_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."voucher_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_product_classification" ADD CONSTRAINT "voucher_product_classification_category_id_voucher_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."voucher_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_products" ADD CONSTRAINT "voucher_products_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_products" ADD CONSTRAINT "voucher_products_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_products" ADD CONSTRAINT "voucher_products_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_voucher_order_id_voucher_orders_id_fk" FOREIGN KEY ("voucher_order_id") REFERENCES "public"."voucher_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secure_token_events" ADD CONSTRAINT "secure_token_events_token_id_secure_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."secure_tokens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secure_tokens" ADD CONSTRAINT "secure_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_process_answers" ADD CONSTRAINT "gift_process_answers_gift_process_id_gift_processes_id_fk" FOREIGN KEY ("gift_process_id") REFERENCES "public"."gift_processes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_process_answers" ADD CONSTRAINT "gift_process_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_process_risk_exclusions" ADD CONSTRAINT "gift_process_risk_exclusions_gift_process_id_gift_processes_id_fk" FOREIGN KEY ("gift_process_id") REFERENCES "public"."gift_processes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_processes" ADD CONSTRAINT "gift_processes_source_process_id_gift_processes_id_fk" FOREIGN KEY ("source_process_id") REFERENCES "public"."gift_processes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_processes" ADD CONSTRAINT "gift_processes_superseded_by_process_id_gift_processes_id_fk" FOREIGN KEY ("superseded_by_process_id") REFERENCES "public"."gift_processes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_processes" ADD CONSTRAINT "gift_processes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_processes" ADD CONSTRAINT "gift_processes_occasion_id_occasions_id_fk" FOREIGN KEY ("occasion_id") REFERENCES "public"."occasions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_processes" ADD CONSTRAINT "gift_processes_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_processes" ADD CONSTRAINT "gift_processes_relationship_id_relationships_id_fk" FOREIGN KEY ("relationship_id") REFERENCES "public"."relationships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_processes" ADD CONSTRAINT "gift_processes_resolved_intent_id_gift_intents_id_fk" FOREIGN KEY ("resolved_intent_id") REFERENCES "public"."gift_intents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_processes" ADD CONSTRAINT "gift_processes_selected_set_id_gift_set_templates_set_id_fk" FOREIGN KEY ("selected_set_id") REFERENCES "public"."gift_set_templates"("set_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_processes" ADD CONSTRAINT "gift_processes_selected_variant_id_gift_variants_id_fk" FOREIGN KEY ("selected_variant_id") REFERENCES "public"."gift_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_processes" ADD CONSTRAINT "gift_processes_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_processes" ADD CONSTRAINT "gift_processes_selected_voucher_id_voucher_products_id_fk" FOREIGN KEY ("selected_voucher_id") REFERENCES "public"."voucher_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cluster_partner_idx" ON "coverage_cluster_partners" USING btree ("cluster_id","partner_id");--> statement-breakpoint
CREATE INDEX "coverage_cluster_partners_cluster_idx" ON "coverage_cluster_partners" USING btree ("cluster_id");--> statement-breakpoint
CREATE INDEX "coverage_cluster_partners_partner_idx" ON "coverage_cluster_partners" USING btree ("partner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cluster_postal_code_pk" ON "coverage_cluster_postal_codes" USING btree ("cluster_id","postal_code");--> statement-breakpoint
CREATE UNIQUE INDEX "postal_code_unique_idx" ON "coverage_cluster_postal_codes" USING btree ("postal_code");--> statement-breakpoint
CREATE INDEX "coverage_cluster_postal_codes_cluster_idx" ON "coverage_cluster_postal_codes" USING btree ("cluster_id");--> statement-breakpoint
CREATE INDEX "invitation_processing_log_invite_id_idx" ON "invitation_processing_log" USING btree ("invite_id");--> statement-breakpoint
CREATE INDEX "invitation_processing_log_admin_id_idx" ON "invitation_processing_log" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "auth_events_user_event_time_idx" ON "auth_events" USING btree ("user_id","event_type","created_at");--> statement-breakpoint
CREATE INDEX "idx_reminders_instance" ON "occasion_reminders" USING btree ("occasion_instance_id");--> statement-breakpoint
CREATE INDEX "idx_reminders_scheduled_for" ON "occasion_reminders" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_reminders_status" ON "occasion_reminders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "partner_terminal_sessions_terminal_idx" ON "partner_terminal_sessions" USING btree ("terminal_id","started_at");--> statement-breakpoint
CREATE INDEX "partner_terminals_partner_user_idx" ON "partner_terminals" USING btree ("partner_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "partner_users_partner_user_idx" ON "partner_users" USING btree ("partner_id","user_id");--> statement-breakpoint
CREATE INDEX "partner_users_status_idx" ON "partner_users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "waitlist_lookup_idx" ON "partner_waitlist" USING btree ("partner_id","is_notified");--> statement-breakpoint
CREATE INDEX "partners_postal_code_idx" ON "partners" USING btree ("postal_code");--> statement-breakpoint
CREATE INDEX "partners_active_priority_idx" ON "partners" USING btree ("active","priority");--> statement-breakpoint
CREATE INDEX "refunds_order_lookup_idx" ON "refunds" USING btree ("order_type","order_id");--> statement-breakpoint
CREATE INDEX "refunds_stripe_refund_id_idx" ON "refunds" USING btree ("stripe_refund_id");--> statement-breakpoint
CREATE INDEX "refunds_correlation_id_idx" ON "refunds" USING btree ("correlation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_voucher_orders_active_process" ON "voucher_orders" USING btree ("gift_process_id") WHERE "voucher_orders"."state" NOT IN ('failed', 'cancelled');--> statement-breakpoint
CREATE UNIQUE INDEX "uq_vouchers_voucher_order_sequence" ON "vouchers" USING btree ("voucher_order_id","sequence");--> statement-breakpoint
CREATE INDEX "secure_token_events_token_idx" ON "secure_token_events" USING btree ("token_id","created_at");--> statement-breakpoint
CREATE INDEX "secure_token_events_ip_time_idx" ON "secure_token_events" USING btree ("ip_address","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "secure_token_hash_idx" ON "secure_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "secure_token_user_type_idx" ON "secure_tokens" USING btree ("user_id","token_type");--> statement-breakpoint
CREATE INDEX "secure_token_entity_type_idx" ON "secure_tokens" USING btree ("entity_type","entity_id","token_type");