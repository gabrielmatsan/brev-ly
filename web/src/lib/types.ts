import { z } from "zod";

// Schema do Link baseado na API
export const linkSchema = z.object({
  id: z.string(),
  originalUrl: z.url(),
  shortUrl: z.string(),
  visits: z.number(),
  createdAt: z.string().or(z.date()),
});

export type Link = z.infer<typeof linkSchema>;

// Schema para criar um link
export const createLinkSchema = z.object({
  originalUrl: z.url(),
  shortUrl: z.string().min(1, "URL encurtada é obrigatória"),
});

export type CreateLink = z.infer<typeof createLinkSchema>;

// Schema de resposta da API para listagem
export const linksResponseSchema = z.object({
  message: z.string(),
  links: z.array(linkSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type LinksResponse = z.infer<typeof linksResponseSchema>;

// Schema de resposta para redirecionamento
export const redirectResponseSchema = z.object({
  message: z.string(),
  originalUrl: z.string(),
});

export type RedirectResponse = z.infer<typeof redirectResponseSchema>;

// Schema de resposta para export CSV
export const exportResponseSchema = z.object({
  message: z.string(),
  url: z.string(),
});

export type ExportResponse = z.infer<typeof exportResponseSchema>; 