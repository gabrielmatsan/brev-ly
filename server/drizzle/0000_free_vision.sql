CREATE TABLE "links" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"original_url" text NOT NULL,
	"short_url" text NOT NULL,
	"visits" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "visits_positive" CHECK (visits >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "short_url_unique" ON "links" USING btree ("short_url");