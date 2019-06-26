ALTER TABLE "submission"
    ADD COLUMN "payment_session_id" text,
    ADD COLUMN "payment_completed" boolean;