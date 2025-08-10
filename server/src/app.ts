import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastify from "fastify";
import { hasZodFastifySchemaValidationErrors, serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import { linkController } from './link/infra/link.controller';
import { env } from './shared/env';
import { transformSwaggerSchema } from './utils/transform-swagger-schema-data';

const app = fastify().withTypeProvider<ZodTypeProvider>()


app.setErrorHandler((error, _request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(422).send({
      message: "Unprocessable Entity",
      details: error.validation,
    })
  }

  console.warn('[APP] - Unexpected error:')
  console.error(error)

  return reply.status(500).send({
    message: "Internal Server Error",
  })
})


app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)
app.register(fastifyMultipart)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'API do Fastify',
      description: 'API do Fastify',
      version: '1.0.0',
    },
    servers: [
      {
        url: `http://localhost:${env.DATAPORT}`,
      }
    ]
  },
  transform: transformSwaggerSchema
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: true,
  }
})

app.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

app.register(linkController)



app.listen({
  port: env.DATAPORT,
  host: '0.0.0.0',
}).then(() => {
  console.log(`[APP] - Server is running on port ${env.DATAPORT}`)
  console.log(`[APP] - Swagger is running on port http://localhost:${env.DATAPORT}/docs`)
})