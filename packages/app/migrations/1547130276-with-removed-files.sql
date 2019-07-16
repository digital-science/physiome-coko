ALTER TABLE "submission-article-files"
    ADD COLUMN "removed" boolean;

ALTER TABLE "submission-supplementary-files"
    ADD COLUMN "removed" boolean;
