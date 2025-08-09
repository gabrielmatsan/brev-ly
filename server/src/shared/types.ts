import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";

export const ID_LENGTH = 32;


export interface Pagination {
  page?: number;
  limit?: number;
}


export type Transaction = PgDatabase<PostgresJsQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>
