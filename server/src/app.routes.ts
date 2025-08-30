import { FastifyPluginAsync } from "fastify"
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import { linkController } from "./link/infra/link.controller"

export const appRoutes: FastifyPluginAsyncZod = async (app) => {
  app.register(linkController, {
    prefix: '/link'
  })
}