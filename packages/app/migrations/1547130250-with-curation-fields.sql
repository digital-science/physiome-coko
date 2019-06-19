ALTER TABLE "submission"
    ADD COLUMN "hidden" boolean,
    ADD COLUMN "primary_paper_exists" boolean,
    ADD COLUMN "results_in_papers_overlap" boolean,
    ADD COLUMN "same_model_in_papers" boolean,
    ADD COLUMN "iups_commission" text;