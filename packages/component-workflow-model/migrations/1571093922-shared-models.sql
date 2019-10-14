CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "identity" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created" timestamptz NOT NULL DEFAULT current_timestamp,
    "updated" timestamptz NOT NULL DEFAULT current_timestamp,

    "type" text,

    "identity_id" text,
    "display_name" text,
    "display_affiliation" text,

    "last_login_date" timestamptz,

    "email" text,
    "is_validated_email" boolean,
    "email_validation_token" text,
    "email_validation_token_expire" timestamptz,
    "email_validation_email_send_times" JSONB,

    "tokens" JSONB,
    "groups" JSONB,

    UNIQUE("type", "identity_id")
);

CREATE INDEX identity_display_name_indx ON "identity" USING gin(to_tsvector('english', display_name));

CREATE TABLE "file" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created" timestamptz NOT NULL DEFAULT current_timestamp,
    "updated" timestamptz NOT NULL DEFAULT current_timestamp,

    "file_name" text,
    "file_display_name" text,
    "file_mime_type" text,
    "file_byte_size" int,

    "storage_type" text,
    "storage_key" text,

    "confirmed" boolean
);