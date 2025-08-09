import { z } from "zod";
import { makeRight, type Either } from "../../shared/either";
import type { Pagination } from "../../shared/types";
import { link } from "../domain/link.type";
import { LinkRepository } from "../infra/link.repository";


export const getAllShorterLinksOutput = z.object({
  links: z.array(link),
  pagination: z.object({
    page: z.coerce.number(),
    limit: z.coerce.number(),
    total: z.coerce.number(),
    totalPages: z.coerce.number(),
  })
})
export type GetAllShorterLinksOutput = z.infer<typeof getAllShorterLinksOutput>

export async function getAllShorterLinks(pagination: Pagination): Promise<Either<unknown, GetAllShorterLinksOutput>> {
  const [{ links, pagination: { limit } }, count] = await Promise.all([
    LinkRepository.get(pagination),
    LinkRepository.count()
  ])


  const totalPages = Math.ceil(count / (limit))

  return makeRight({
    links,
    pagination: {
      page: pagination.page ?? 1,
      limit: pagination.limit ?? 10,
      total: count,
      totalPages,
    }
  })
}