CREATE AGGREGATE tsvector_agg (tsvector) (
  SFUNC = tsvector_concat,
  STYPE = tsvector
);

CREATE OR REPLACE FUNCTION submission_authors_names_to_tsvector( jsondata jsonb, out tsv tsvector )
AS $func$
  BEGIN
    SELECT INTO tsv
      tsvector_agg(to_tsvector('english', d->>'name'))
    FROM jsonb_array_elements(jsondata) AS d;
    RETURN;
  END;
$func$ LANGUAGE plpgsql
IMMUTABLE;


CREATE INDEX submission_title_indx ON "submission" USING gin(to_tsvector('english', title));

CREATE INDEX submission_authors_indx ON "submission" USING gin(submission_authors_names_to_tsvector(authors));

CREATE INDEX identity_display_name_indx ON "identity" USING gin(to_tsvector('english', display_name));

