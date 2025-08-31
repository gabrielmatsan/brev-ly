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
const isProduction = true
const datadogApiKey = env.DD_API_KEY;
console.log(datadogApiKey)
let traceExporter;
let metricExporter;

if (isProduction && datadogApiKey) {
  // Configuração para produção - envia para Datadog via OTLP
  traceExporter = new OTLPTraceExporter({
    url: `https://trace-intake.${env.DD_SITE || 'datadoghq.com'}/api/v0.2/traces`,
    headers: {
      'DD-API-KEY': datadogApiKey,
    },
  });

  metricExporter = new OTLPMetricExporter({
    url: `https://api.${env.DD_SITE || 'datadoghq.com'}/api/v2/series`,
    headers: {
      'DD-API-KEY': datadogApiKey,
    },
  });
} else {
  // Configuração para desenvolvimento - apenas traces no console
  traceExporter = new ConsoleSpanExporter();
  metricExporter = null; // Desabilita métricas em desenvolvimento
}

// Configuração do SDK
const sdkConfig: any = {
  resource,
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      // Configurações específicas para instrumentações
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // Desabilita instrumentação de filesystem
      },
      '@opentelemetry/instrumentation-dns': {
        enabled: false, // Desabilita instrumentação de DNS em desenvolvimento
      },
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        // Desabilita logs verbosos de requests
        ignoreIncomingRequestHook: (req) => {
          const url = (req as any).url || '';
          // Ignora health checks e assets estáticos
          return url.includes('/health') ||
            url.includes('/favicon.ico') ||
            url.includes('/static/');
        },
      },
      '@opentelemetry/instrumentation-express': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-pg': {
        enabled: true,
      },
    }),
  ],
};

// Só adiciona métricas em produção
if (isProduction && metricExporter) {
  sdkConfig.metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 60000, // 1 minuto
  });
}

const sdk = new NodeSDK(sdkConfig);

// Inicializa o SDK
sdk.start();

console.log(`[OTEL] OpenTelemetry iniciado`);
console.log(`[OTEL] Ambiente: ${env.NODE_ENV || 'development'}`);
console.log(`[OTEL] Métricas: ${isProduction && metricExporter ? 'Habilitadas' : 'Desabilitadas'}`);

export { sdk };
