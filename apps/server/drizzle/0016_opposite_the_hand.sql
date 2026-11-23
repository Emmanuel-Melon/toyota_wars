ALTER TABLE "user_invites" ADD COLUMN "role" "user_role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_invites" ADD COLUMN "partner_assignment" jsonb;--> statement-breakpoint
ALTER TABLE "user_invites" ADD COLUMN "invited_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "user_invites" ADD CONSTRAINT "user_invites_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;