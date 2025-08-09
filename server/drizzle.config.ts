import { defineConfig } from "drizzle-kit";
import { env } from "./src/shared/env";

export default defineConfig({
  schema: "./src/*/domain/*.schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});