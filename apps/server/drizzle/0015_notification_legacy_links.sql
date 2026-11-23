-- Notifications created before the action registry point at web routes that no
-- longer exist (e.g. the welcome notification's /dashboard/profile/:id). Clear
-- those links so the items show as informational instead of opening a 404.
UPDATE "notifications"
SET "action_url" = NULL
WHERE "action_url" ~ '^/(dashboard|billing|auth/security|gifting/|subscription-plans|reset-password|vouchers/|occasions/[^/]+/)';
