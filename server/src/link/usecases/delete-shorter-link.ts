import { makeLeft, makeRight, type Either } from "@/shared/either";
import { NotFoundError } from "@/shared/errors/not-found-error";
import { z } from "zod/v4";
import { LinkRepository } from "../infra/link.repository";


export const deleteShorterLinkInput = z.object({
  id: z.string().min(1),
});

export type DeleteShorterLinkInput = z.infer<typeof deleteShorterLinkInput>;

export async function deleteShorterLink({ id }: DeleteShorterLinkInput): Promise<Either<NotFoundError, { success: boolean }>> {
  try {
    const result = await LinkRepository.delete(id);

    if (!result) {
      return makeLeft(new NotFoundError("Link not found"));
    }

    return makeRight({ success: true });
  } catch (error) {
    console.error('Error in deleteShorterLink use case:', error);
    throw error;
  }
}