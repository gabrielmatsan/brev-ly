import './shared/observality/instrumentation';

import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastify from "fastify";
import { hasZodFastifySchemaValidationErrors, serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import { appRoutes } from './app.routes';
import { env } from './shared/env';
import { logger, loggerUtils } from './shared/observality/logger';
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

// Middleware de logging para requests
app.addHook('onRequest', async (request: any, reply) => {
  request.startTime = Date.now();
});

app.addHook('onResponse', async (request: any, reply) => {
  const responseTime = Date.now() - (request.startTime || Date.now());

  // Só loga requests importantes (não health checks ou assets)
  const shouldLog = //!request.url.includes('/health') &&
    !request.url.includes('/favicon.ico') &&
    !request.url.includes('/static/');

  if (shouldLog) {
    loggerUtils.logRequest(
      request.method,
      request.url,
      reply.statusCode,
      responseTime
    );
  }
});

// Middleware de tratamento de erros com logging estruturado
app.addHook('onError', async (request, reply, error) => {
  loggerUtils.logError(error, {
    method: request.method,
    url: request.url,
    headers: request.headers,
    query: request.query,
  });
});

app.register(fastifyMultipart)


if (env.NODE_ENV !== 'production') {
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
}

app.register(fastifyCors, {
  origin: env.NODE_ENV === 'production'
    ? env.FRONTEND_URL
    : [env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
})

app.register(appRoutes, {
  prefix: '/v1'
})

app.get('/health', (_, reply) => {
  logger.info('Health check executado');
  return reply.status(200).send({
    message: 'OK'
  })
})


app.listen({
  port: env.DATAPORT,
  host: '0.0.0.0',
}).then(() => {
  loggerUtils.logStartup(`[APP] Server iniciado com sucesso`, {
    port: env.DATAPORT,
    environment: env.NODE_ENV,
    swagger_url: `http://localhost:${env.DATAPORT}/docs`,
  });

  console.log(`[APP] - Server is running on port ${env.DATAPORT}`)
  console.log(`[APP] - Swagger is running on port http://localhost:${env.DATAPORT}/docs`)

  // Log de métrica de startup
  loggerUtils.logMetric('app.startup', 1, {
    environment: env.NODE_ENV || 'development',
    port: env.DATAPORT.toString(),
  });
}).catch((error) => {
  loggerUtils.logStartupError(error);
  process.exit(1);
})