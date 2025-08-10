import { eq, sql } from "drizzle-orm";
import { db } from "../../shared/database/db";
import type { Pagination, Transaction } from "../../shared/types";
import { linkSchema } from "../domain/link.schema";
import type { Link } from "../domain/link.type";


interface UpdateLinkRecord {
  link: Partial<Omit<Link, "id" | "createdAt" | "updatedAt">>
  id: string
}

// biome-ignore lint/complexity/noStaticOnlyClass: <classe estática>
export class LinkRepository {
  static async create(link: Omit<Link, "id" | "createdAt" | "updatedAt" | "visits">): Promise<Link> {
    // O método returning() retorna um array de resultados, então precisamos pegar o primeiro elemento
    const [createdLink] = await db.insert(linkSchema).values({ ...link }).returning();

    return createdLink;
  }

  static async findByShortUrl(shortUrl: string, tx?: Transaction): Promise<Link | null> {
    const dbConnection = tx ?? db
    const [foundLink] = await dbConnection.select().from(linkSchema).where(eq(linkSchema.shortUrl, shortUrl)).limit(1);

    return foundLink;
  }

  static async get(pagination: Pagination): Promise<{
    links: Link[], pagination: {
      page: number,
      limit: number,
      offset: number,
    }
  }> {
    const { limit = 10, page = 1 } = pagination;

    const offset = (page - 1) * limit;

    const links = await db
      .select()
      .from(linkSchema)
      .limit(limit)
      .offset(offset);

    return {
      links,
      pagination: {
        page,
        limit,
        offset,
      }
    };
  }

  static async count(): Promise<number> {
    const [{ count }] = await db
      .select({
        count: sql<number>`COUNT(*)::integer`
      })
      .from(linkSchema);

    return count;
  }


  static async update({ link, id }: UpdateLinkRecord, tx?: Transaction): Promise<Link> {

    const dbConnection = tx ?? db

    const [updatedLink] = await dbConnection
      .update(linkSchema)
      .set(link)
      .where(eq(linkSchema.id, id)).returning();

    return updatedLink;
  }

  static async delete(id: string, tx?: Transaction): Promise<Link | null> {
    const dbConnection = tx ?? db

    const [deletedLink] = await dbConnection.delete(linkSchema).where(eq(linkSchema.id, id)).returning();

    return deletedLink;
  }
}