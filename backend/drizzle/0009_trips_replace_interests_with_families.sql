ALTER TABLE trips ADD COLUMN families TEXT NOT NULL DEFAULT '{"outdoor":0,"cultural":0,"food":0,"leisure":0}';
--> statement-breakpoint
ALTER TABLE trips DROP COLUMN interests;
