import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { isLeft, unwrapEither } from "../../shared/either";
import { BadRequestError } from "../../shared/errors/bad-request-error";
import { link } from "../domain/link.type";
import { createShorterLink, createShorterLinkInput } from "../usecases/create-shorter-link";
import { deleteShorterLink } from "../usecases/delete-shorter-link";
import { exportUrlsToCsv } from "../usecases/export-urls-to-csv";
import { getAllShorterLinks } from "../usecases/get-all-shorter-links";
import { getOriginalUrlByShortUrl } from "../usecases/get-original-url-by-short-url";

export const linkController: FastifyPluginAsyncZod = async app => {
  // Criar link encurtado
  app.post('/shorten', {
    schema: {
      body: createShorterLinkInput,
      response: {
        201: z.object({
          id: z.string(),
          originalUrl: z.string(),
          shortUrl: z.string(),
          visits: z.number(),
          createdAt: z.date(),
        }),
        400: z.object({
          message: z.string(),
        }),
        500: z.object({
          message: z.string(),
        })
      }
    }
  }, async (request, reply) => {

    const { originalUrl, shortUrl } = request.body

    const result = await createShorterLink({
      originalUrl,
      shortUrl,
    })

    if (isLeft(result)) {
      const error = result.left
      return reply.code(error.statusCode).send({
        message: error.message
      })
    }

    return reply.code(201).send(result.right)
  });

  // Listar todos os links
  app.get('/', {
    schema: {
      querystring: z.object({
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(10),
      }),
      response: {
        200: z.object({
          message: z.string(),
          links: z.array(link),
          pagination: z.object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            totalPages: z.number(),
          })
        }),
        500: z.object({
          message: z.string(),
        })
      },
    }
  }, async (request, reply) => {

    const { page, limit } = request.query


    const result = await getAllShorterLinks({
      page,
      limit,
    })


    if (isLeft(result)) {
      const error = unwrapEither(result)

      console.log(error)

      return reply.code(500).send({
        message: 'Internal Server Error'
      })
    }

    return reply.code(200).send({
      message: 'Links fetched successfully',
      ...result.right
    })
  });

  // Exportar todos os links para um arquivo CSV
  app.post('/export', {
    schema: {
      response: {
        200: z.object({
          url: z.string(),
          message: z.string(),
        }),
        500: z.object({
          message: z.string(),
        })
      }
    }
  }, async (_request, reply) => {

    const result = await exportUrlsToCsv()

    if (isLeft(result)) {
      console.error(unwrapEither(result))

      return reply.code(500).send({
        message: 'Internal Server Error'
      })
    }

    return reply.code(200).send({
      message: 'Exported successfully',
      url: result.right.reportUrl,
    })
  }
  )

  // obter a url original via short url e atualizar o contador de visitas
  app.patch("/shortUrl/:url", {
    schema: {
      params: z.object({
        url: z.string(),
      }),
      response: {
        200: z.object({
          message: z.string(),
          originalUrl: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
        500: z.object({
          message: z.string(),
        })
      }
    }
  }, async (request, reply) => {
    const { url } = request.params

    const result = await getOriginalUrlByShortUrl({
      url
    })

    if (isLeft(result)) {
      const error = unwrapEither(result)

      console.error(error)
      return reply.code(error.statusCode ?? 500).send({
        message: error.message ?? 'Internal Server Error'
      })
    }

    return reply.code(200).send({
      message: 'Original URL fetched successfully',
      originalUrl: result.right.originalUrl,
    })
  })

  // Deletar link encurtado
  app.delete('/shortUrl/:urlId', {
    schema: {
      params: z.object({
        urlId: z.string(),
      }),
      response: {
        200: z.object({
          message: z.string(),
        }),
        404: z.object({
          message: z.string(),
        }),
        500: z.object({
          message: z.string(),
        })
      }
    }
  }, async (request, reply) => {
    const { urlId } = request.params

    const result = await deleteShorterLink({
      id: urlId,
    })

    if (isLeft(result)) {
      const error = unwrapEither(result)
      console.error(error)

      return reply.code(error.statusCode ?? 500).send({
        message: error.message ?? 'Internal Server Error'
      })
    }

    return reply.code(200).send({
      message: 'Link deleted successfully',
    })

  })
}