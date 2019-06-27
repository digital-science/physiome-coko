CREATE SEQUENCE manuscript_id;

ALTER TABLE "submission"
    ADD COLUMN "manuscript_id" text;