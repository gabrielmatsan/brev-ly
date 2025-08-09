import { z } from "zod/v4";

export const link = z.object({
  id: z.string(),
  originalUrl: z.string(),
  shortUrl: z.string(),
  visits: z.number(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export type Link = z.infer<typeof link>;
