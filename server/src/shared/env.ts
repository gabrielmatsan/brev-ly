import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  FRONTEND_URL: z.url(),
  DATAPORT: z.coerce.number().default(3000),
  DATABASE_URL: z.url(),


  CLOUDFLARE_ACCOUNT_ID: z.string(),
  CLOUDFLARE_ACCESS_KEY_ID: z.string(),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string(),
  CLOUDFLARE_BUCKET: z.string(),
  CLOUDFLARE_PUBLIC_URL: z.string(),


  // Datadog
  DD_SERVICE: z.string().default("brev-ly-api"),
  DD_ENV: z.string().default("development"),
  DD_VERSION: z.string().default("1.0.0"),
  DD_TRACE_ENABLED: z.coerce.boolean().default(true),
  DD_TRACE_DEBUG: z.coerce.boolean().default(false),
  DD_TRACE_STARTUP_LOGS: z.coerce.boolean().default(true),
  DD_LOGS_INJECTION: z.coerce.boolean().default(true),
  DD_RUNTIME_METRICS_ENABLED: z.coerce.boolean().default(true),
  DD_PROFILING_ENABLED: z.coerce.boolean().default(false),
  DD_API_KEY: z.string().optional(),
  DD_SITE: z.string().optional(),
  DD_TAGS: z.string().default("team:backend,region:us-east-1").optional(),
  DATADOG_TAGS: z.string().default("team:backend,region:us-east-1").optional(),
});

export const env = envSchema.parse(process.env);