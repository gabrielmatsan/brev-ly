import { z } from "zod";

const envSchema = z.object({
  FRONTEND_URL: z.url(),
  DATAPORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  CLOUDFLARE_ACCESS_KEY_ID: z.string(),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string(),
  CLOUDFLARE_BUCKET: z.string(),
  CLOUDFLARE_PUBLIC_URL: z.string(),
});

export const env = envSchema.parse(process.env);