ALTER TABLE "gift_set_templates" ADD COLUMN "icon" text;--> statement-breakpoint
ALTER TABLE "gift_set_templates" ADD COLUMN "color" varchar(7);--> statement-breakpoint
-- Backfill artwork for tones that already exist (matched by label).
UPDATE "gift_set_templates" AS t SET "icon" = v.icon, "color" = v.color FROM (VALUES
  ('A Quiet Moment', 'a-quiet-moment', '#CE8A39'),
  ('Take a Breath', 'take-a-breath', '#1984CB'),
  ('Close & Humorous', 'close-humorous', '#433AB8'),
  ('Distant & Thoughtful', 'distant-thoughtful', '#AC7D85'),
  ('Distant & Formal', 'distant-formal', '#809097'),
  ('Distant & Casual', 'distant-casual', '#87BC59'),
  ('Celebratory & Joyful', 'celebratory-joyful', '#3FAAB5'),
  ('Celebratory & Elegant', 'celebratory-elegant', '#319D69'),
  ('Celebratory & Modern', 'celebratory-modern', '#BC9359'),
  ('Supportive & Comforting', 'supportive-comforting', '#D6652B'),
  ('Supportive & Practical', 'supportive-practical', '#2E3A4A'),
  ('Supportive & Adventurous', 'supportive-adventurous', '#CEA031'),
  ('Romantic & Intimate', 'romantic-intimate', '#C53635'),
  ('Romantic & Grand', 'romantic-grand', '#A73FB5'),
  ('Romantic & Playful', 'romantic-playful', '#69001A')
) AS v(label, icon, color) WHERE t."label" = v.label;
