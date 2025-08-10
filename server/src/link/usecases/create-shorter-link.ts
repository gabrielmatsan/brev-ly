/** biome-ignore-all assist/source/organizeImports: <> */
import z from "zod/v4";
import { makeLeft, makeRight, type Either } from "../../shared/either";
import { env } from "../../shared/env";
import { BadRequestError } from "../../shared/errors/bad-request-error";
import { generateId } from "../../shared/generate-id";
import type { Link } from "../domain/link.type";
import { LinkRepository } from "../infra/link.repository";

export const createShorterLinkInput = z.object({
  originalUrl: z.url(),
  shortUrl: z.string().nullable().optional(),
})
export type CreateShorterLinkInput = z.infer<typeof createShorterLinkInput>


export async function createShorterLink(input: CreateShorterLinkInput): Promise<Either<BadRequestError, Link>> {
  const { originalUrl, shortUrl } = input;

  let shortUrlCandidate = shortUrl;
  if (!shortUrlCandidate) {
    shortUrlCandidate = generateId('alphanumeric')
  }

  // Salvar apenas a parte encurtada, não a URL completa
  const isShortUrlAvailable = await LinkRepository.findByShortUrl(shortUrlCandidate)

  if (isShortUrlAvailable) {
    return makeLeft(new BadRequestError('Short URL already exists'))
  }

  const link = await LinkRepository.create({
    originalUrl,
    shortUrl: shortUrlCandidate,
  })

  return makeRight(link)
}
