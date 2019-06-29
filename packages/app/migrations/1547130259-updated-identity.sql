ALTER TABLE "identity"
    ADD COLUMN "email" text,
    ADD COLUMN "is_validated_email" boolean,
    ADD COLUMN "email_validation_token" text,
    ADD COLUMN "email_validation_token_expire" timestamptz;

ALTER TABLE "identity"
    DROP COLUMN "access_token",
    DROP COLUMN "refresh_token",
    DROP COLUMN "access_scope",
    DROP COLUMN "access_token_expire",
    DROP COLUMN "groups";

ALTER TABLE "identity"
    ADD COLUMN "tokens" JSONB,
    ADD COLUMN "groups" JSONB;