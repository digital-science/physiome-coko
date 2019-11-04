ALTER TABLE "file" ADD COLUMN
    uploader_id uuid REFERENCES "identity";
