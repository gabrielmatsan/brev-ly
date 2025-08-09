import { sql } from "drizzle-orm";
import { check, integer, pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { generateId } from "../../shared/generate-id";
import { ID_LENGTH } from "../../shared/types";
export const linkSchema = pgTable("links", {
  id: varchar("id", { length: ID_LENGTH }).primaryKey().$defaultFn(() => generateId('cuid')),
  originalUrl: text("original_url").notNull(),
  shortUrl: text("short_url").notNull(),
  visits: integer("visits").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}, (t) => [
  uniqueIndex("short_url_unique").on(t.shortUrl),
  check("visits_positive", sql`visits >= 0`),
]);