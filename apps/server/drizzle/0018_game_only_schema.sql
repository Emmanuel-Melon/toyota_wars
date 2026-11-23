-- Keep only the Toyota Wars game schema: missions, tanks, unit templates and weapons.

DROP SCHEMA IF EXISTS "pgboss" CASCADE;

DROP TABLE IF EXISTS "addresses" CASCADE;
DROP TABLE IF EXISTS "allowed_emails" CASCADE;
DROP TABLE IF EXISTS "auth_events" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "coverage_cluster_partners" CASCADE;
DROP TABLE IF EXISTS "coverage_cluster_postal_codes" CASCADE;
DROP TABLE IF EXISTS "coverage_clusters" CASCADE;
DROP TABLE IF EXISTS "decisions" CASCADE;
DROP TABLE IF EXISTS "gift_classifier_answers" CASCADE;
DROP TABLE IF EXISTS "gift_classifier_questions" CASCADE;
DROP TABLE IF EXISTS "gift_intents" CASCADE;
DROP TABLE IF EXISTS "gift_process_answers" CASCADE;
DROP TABLE IF EXISTS "gift_process_risk_exclusions" CASCADE;
DROP TABLE IF EXISTS "gift_processes" CASCADE;
DROP TABLE IF EXISTS "gift_set_templates" CASCADE;
DROP TABLE IF EXISTS "gift_suggestions" CASCADE;
DROP TABLE IF EXISTS "gift_variants" CASCADE;
DROP TABLE IF EXISTS "gifts" CASCADE;
DROP TABLE IF EXISTS "idempotency_keys" CASCADE;
DROP TABLE IF EXISTS "invitation_processing_log" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "occasion_participants" CASCADE;
DROP TABLE IF EXISTS "occasion_reminders" CASCADE;
DROP TABLE IF EXISTS "occasions" CASCADE;
DROP TABLE IF EXISTS "partner_invites" CASCADE;
DROP TABLE IF EXISTS "partner_products" CASCADE;
DROP TABLE IF EXISTS "partner_terminal_sessions" CASCADE;
DROP TABLE IF EXISTS "partner_terminals" CASCADE;
DROP TABLE IF EXISTS "partner_users" CASCADE;
DROP TABLE IF EXISTS "partner_waitlist" CASCADE;
DROP TABLE IF EXISTS "partners" CASCADE;
DROP TABLE IF EXISTS "product_intent_weights" CASCADE;
DROP TABLE IF EXISTS "product_relationship_depth_weights" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "push_subscriptions" CASCADE;
DROP TABLE IF EXISTS "relationship_answers" CASCADE;
DROP TABLE IF EXISTS "relationship_proximity_map" CASCADE;
DROP TABLE IF EXISTS "relationship_shipping_addresses" CASCADE;
DROP TABLE IF EXISTS "relationships" CASCADE;
DROP TABLE IF EXISTS "secure_token_events" CASCADE;
DROP TABLE IF EXISTS "secure_tokens" CASCADE;
DROP TABLE IF EXISTS "sessions" CASCADE;
DROP TABLE IF EXISTS "user_invites" CASCADE;
DROP TABLE IF EXISTS "user_notification_preferences" CASCADE;
DROP TABLE IF EXISTS "user_onboarding" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

DROP TYPE IF EXISTS "classifier_question_type" CASCADE;
DROP TYPE IF EXISTS "classifier_scope" CASCADE;
DROP TYPE IF EXISTS "coverage" CASCADE;
DROP TYPE IF EXISTS "coverage_cluster_status" CASCADE;
DROP TYPE IF EXISTS "decision_type" CASCADE;
DROP TYPE IF EXISTS "energy_level" CASCADE;
DROP TYPE IF EXISTS "gift_detection_status" CASCADE;
DROP TYPE IF EXISTS "gift_entry_mode" CASCADE;
DROP TYPE IF EXISTS "gift_outcome" CASCADE;
DROP TYPE IF EXISTS "gift_process_status" CASCADE;
DROP TYPE IF EXISTS "gift_process_step" CASCADE;
DROP TYPE IF EXISTS "gift_relationship_depth" CASCADE;
DROP TYPE IF EXISTS "gift_risk_exclusion" CASCADE;
DROP TYPE IF EXISTS "gift_signal_intensity" CASCADE;
DROP TYPE IF EXISTS "idempotency_state" CASCADE;
DROP TYPE IF EXISTS "intensity_level" CASCADE;
DROP TYPE IF EXISTS "invite_status" CASCADE;
DROP TYPE IF EXISTS "notification_channel" CASCADE;
DROP TYPE IF EXISTS "notification_failure_reason" CASCADE;
DROP TYPE IF EXISTS "notification_status" CASCADE;
DROP TYPE IF EXISTS "notification_type" CASCADE;
DROP TYPE IF EXISTS "occasion_reminder_status" CASCADE;
DROP TYPE IF EXISTS "occasion_reminder_type" CASCADE;
DROP TYPE IF EXISTS "occasion_status" CASCADE;
DROP TYPE IF EXISTS "partner_invite_status" CASCADE;
DROP TYPE IF EXISTS "partner_member_role" CASCADE;
DROP TYPE IF EXISTS "partner_member_status" CASCADE;
DROP TYPE IF EXISTS "partner_status" CASCADE;
DROP TYPE IF EXISTS "proximity_level" CASCADE;
DROP TYPE IF EXISTS "recipient_type" CASCADE;
DROP TYPE IF EXISTS "recurrence_type" CASCADE;
DROP TYPE IF EXISTS "secure_token_event_type" CASCADE;
DROP TYPE IF EXISTS "secure_token_type" CASCADE;
DROP TYPE IF EXISTS "selected_tone_code" CASCADE;
DROP TYPE IF EXISTS "social_mode" CASCADE;
DROP TYPE IF EXISTS "stock_status" CASCADE;
DROP TYPE IF EXISTS "terminal_status" CASCADE;
DROP TYPE IF EXISTS "user_role" CASCADE;
--> statement-breakpoint
CREATE TABLE "public"."missions" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"order" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"briefing" text NOT NULL,
	"difficulty" integer NOT NULL,
	"requires" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"arena" jsonb NOT NULL,
	"squads" jsonb NOT NULL,
	"objectives" jsonb NOT NULL,
	"fail_conditions" jsonb NOT NULL,
	"rewards" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "missions_order_unique" UNIQUE("order")
);
--> statement-breakpoint
CREATE TABLE "public"."tanks" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"personality" varchar(50) NOT NULL,
	"traits" jsonb NOT NULL,
	"health" integer DEFAULT 100 NOT NULL,
	"speed" real DEFAULT 1.0 NOT NULL,
	"fire_range" real DEFAULT 60 NOT NULL,
	"fighting_distance" real DEFAULT 55 NOT NULL,
	"behavior_tree" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public"."unit_templates" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"label" varchar(100) NOT NULL,
	"max_health" integer NOT NULL,
	"damage_scale" real NOT NULL,
	"palettes" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public"."weapons" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"label" varchar(100) NOT NULL,
	"mechanism" varchar(50) NOT NULL,
	"direct_suppression" real NOT NULL,
	"indirect_firepower" real NOT NULL,
	"preferred_range" real NOT NULL,
	"engagement_range" real NOT NULL,
	"cooldown" real NOT NULL,
	"spread" real NOT NULL,
	"recoil" real NOT NULL,
	"ammo_cost" integer DEFAULT 1 NOT NULL,
	"muzzle" jsonb NOT NULL,
	"muzzles" jsonb,
	"projectile" jsonb NOT NULL,
	"audio" jsonb NOT NULL,
	"visual" jsonb NOT NULL,
	"explosion" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
