import { trace } from '@opentelemetry/api';
import pino from "pino";

const isProduction = process.env.NODE_ENV === 'production';
const datadogApiKey = process.env.DATADOG_API_KEY;

// Configuração base do logger
const baseConfig = {
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  // Adiciona informações de trace automaticamente
  mixin: () => {
    const span = trace.getActiveSpan();
    if (span) {
      const spanContext = span.spanContext();
      return {
        trace_id: spanContext.traceId,
        span_id: spanContext.spanId,
        service: 'brev-ly-api',
        version: '1.0.0',
        env: process.env.DD_ENV || 'development',
      };
    }
    return {
      service: 'brev-ly-api',
      version: '1.0.0',
      env: process.env.DD_ENV || 'development',
    };
  },
};

let loggerConfig;

if (isProduction && datadogApiKey) {
  // Configuração para produção - formato JSON para Datadog
  loggerConfig = {
    ...baseConfig,
    // Em produção, usa formato JSON estruturado para melhor integração com Datadog
    timestamp: pino.stdTimeFunctions.isoTime,
    messageKey: 'message',
    errorKey: 'error',
    base: {
      hostname: process.env.DD_HOSTNAME || require('os').hostname(),
      pid: process.pid,
    },
  };
} else {
  // Configuração para desenvolvimento - formato pretty
  loggerConfig = {
    ...baseConfig,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: true,
        levelFirst: true,
        include: 'level,time,trace_id,span_id',
        translateTime: 'yyyy-mm-dd HH:MM:ss.l',
        ignore: 'hostname,pid',
      }
    }
  };
}

export const logger = pino(loggerConfig);

// Utilitários para logging estruturado
export const loggerUtils = {
  // Log de request HTTP
  logRequest: (method: string, url: string, statusCode: number, responseTime: number) => {
    logger.info({
      http: {
        method,
        url,
        status_code: statusCode,
        response_time_ms: responseTime,
      },
      dd: {
        trace_id: trace.getActiveSpan()?.spanContext().traceId,
        span_id: trace.getActiveSpan()?.spanContext().spanId,
      }
    }, `${method} ${url} - ${statusCode} (${responseTime}ms)`);
  },

  // Log de erro estruturado
  logError: (error: Error, context?: Record<string, any>) => {
    logger.error({
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      dd: {
        trace_id: trace.getActiveSpan()?.spanContext().traceId,
        span_id: trace.getActiveSpan()?.spanContext().spanId,
      }
    }, `Error: ${error.message}`);
  },

  // Log de métrica customizada
  logMetric: (name: string, value: number, tags?: Record<string, string>) => {
    logger.info({
      metric: {
        name,
        value,
        tags,
        timestamp: Date.now(),
      },
      dd: {
        trace_id: trace.getActiveSpan()?.spanContext().traceId,
        span_id: trace.getActiveSpan()?.spanContext().spanId,
      }
    }, `Metric: ${name} = ${value}`);
  },

  // Log de startup
  logStartup: (message: string, context?: Record<string, any>) => {
    logger.info({
      startup: true,
      ...context,
      dd: {
        trace_id: trace.getActiveSpan()?.spanContext().traceId,
        span_id: trace.getActiveSpan()?.spanContext().spanId,
      }
    }, message);
  },

  // Log de startup error
  logStartupError: (error: Error) => {
    loggerUtils.logError(error, { phase: 'startup' });
  },
};

// Logs de inicialização mais limpos
if (!isProduction) {
  console.log(`[LOGGER] Logger configurado para desenvolvimento`);
}

