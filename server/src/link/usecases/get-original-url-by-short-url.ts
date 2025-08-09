import z from "zod";
import { db } from "../../shared/database/db";
import { makeLeft, makeRight, type Either } from "../../shared/either";
import { NotFoundError } from "../../shared/errors/not-found-error";
import { LinkRepository } from "../infra/link.repository";


export const getOriginalUrlByShortUrlOutput = z.object({
  originalUrl: z.string(),
})

export type GetOriginalUrlByShortUrlOutput = z.infer<typeof getOriginalUrlByShortUrlOutput>

export async function getOriginalUrlByShortUrl({ url }: { url: string }): Promise<Either<NotFoundError, GetOriginalUrlByShortUrlOutput>> {
  return await db.transaction(async (tx) => {
    const link = await LinkRepository.findByShortUrl(url, tx)

    if (!link) {
      return makeLeft(new NotFoundError('Link not found'))
    }
    await LinkRepository.update({
      link: {
        visits: link.visits + 1
      },
      id: link.id
    }, tx)

    return makeRight({
      originalUrl: link.originalUrl,
    })
  })
}