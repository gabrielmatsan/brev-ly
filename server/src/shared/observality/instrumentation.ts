/*instrumentation.ts*/
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter, ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-node';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION
} from '@opentelemetry/semantic-conventions';
import { env } from '../env';

// Configuração do resource com informações do serviço
const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'brev-ly-api',
  [ATTR_SERVICE_VERSION]: '1.0.0',
  'deployment.environment': env.DD_ENV || 'development',
});

// Configuração dos exportadores baseada no ambiente
const isProduction = true;
const datadogApiKey = env.DD_API_KEY;
const datadogSite = env.DD_SITE || 'datadoghq.com';

console.log(`[OTEL] Datadog API Key: ${datadogApiKey ? '[CONFIGURADA]' : '[NÃO CONFIGURADA]'}`);
console.log(`[OTEL] Ambiente: ${env.DD_ENV || 'development'}`);
console.log(`[OTEL] Site Datadog: ${datadogSite}`);

let traceExporter;
let metricExporter;

if (datadogApiKey) {
  console.log(`[OTEL] Configurando exportadores para Datadog`);

  // CORREÇÃO 1: URL correta para traces OTLP no Datadog
  traceExporter = new OTLPTraceExporter({
    url: `https://otlp.${datadogSite}/v1/traces`,
    headers: {
      'DD-API-KEY': datadogApiKey,
    },
    // Adicione timeout se necessário
    timeoutMillis: 10000,
  });

  // CORREÇÃO 2: URL correta para métricas OTLP no Datadog
  if (isProduction) {
    metricExporter = new OTLPMetricExporter({
      url: `https://otlp.${datadogSite}/v1/metrics`,
      headers: {
        'DD-API-KEY': datadogApiKey,
      },
      timeoutMillis: 10000,
    });
    console.log('[OTEL] Métricas habilitadas para produção');
  } else {
    console.log('[OTEL] Métricas desabilitadas em desenvolvimento');
  }
} else {
  console.log('[OTEL] DD_API_KEY não encontrada, usando console para traces');
  traceExporter = new ConsoleSpanExporter();
}

// Configuração do SDK
const sdkConfig: any = {
  resource,
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      // Configurações das instrumentações
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-dns': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        ignoreIncomingRequestHook: (req) => {
          const url = (req as any).url || '';
          return url.includes('/health') ||
            url.includes('/favicon.ico') ||
            url.includes('/static/') ||
            url.includes('/metrics');
        },
        // CORREÇÃO 3: Configuração adicional para melhor rastreamento
        requestHook: (span, request) => {
          span.setAttributes({
            'http.request.header.user-agent': (request as any).headers?.['user-agent'],
            'http.request.header.content-type': (request as any).headers?.['content-type'],
          });
        },
      },
      '@opentelemetry/instrumentation-express': {
        enabled: false, // Desabilita Express já que usamos Fastify
      },
      '@opentelemetry/instrumentation-pg': {
        enabled: true,
      },
    }),
  ],
};

// Adiciona reader de métricas apenas se configurado
if (isProduction && metricExporter) {
  sdkConfig.metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 60000, // 1 minuto
  });
}

// Inicialização do SDK
const sdk = new NodeSDK(sdkConfig);

// Tratamento de erros na inicialização
process.on('SIGTERM', () => {
  console.log('[OTEL] Desligando OpenTelemetry...');
  sdk.shutdown()
    .then(() => console.log('[OTEL] OpenTelemetry desligado com sucesso'))
    .catch((error) => console.error('[OTEL] Erro ao desligar OpenTelemetry:', error))
    .finally(() => process.exit(0));
});

try {
  sdk.start();
  console.log(`[OTEL] OpenTelemetry iniciado com sucesso!`);
  console.log(`[OTEL] Traces: ${datadogApiKey ? 'Enviando para Datadog' : 'Console apenas'}`);
  console.log(`[OTEL] Métricas: ${isProduction && metricExporter ? 'Habilitadas (Datadog)' : 'Desabilitadas'}`);
} catch (error) {
  console.error('[OTEL] Erro ao inicializar OpenTelemetry:', error);
}

export { sdk };
