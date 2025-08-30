# 🔗 Brev.ly - Encurtador de URLs

Uma aplicação moderna de encurtamento de URLs construída com React, Node.js e implantada na AWS com infraestrutura como código.

## 🏗️ Arquitetura

### Frontend

- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Estado**: React Query (TanStack Query)
- **Deploy**: AWS CloudFront + S3
- **SSL**: AWS Certificate Manager (ACM)

### Backend

- **Framework**: Fastify + TypeScript
- **Validação**: Zod
- **Database**: PostgreSQL (Neon)
- **Storage**: Cloudflare R2
- **Deploy**: AWS ECS Fargate
- **Load Balancer**: AWS Application Load Balancer

### Infraestrutura

- **Cloud Provider**: AWS
- **DNS**: Cloudflare
- **IaC**: Terraform
- **CI/CD**: GitHub Actions
- **Containerização**: Docker
- **Monitoramento**: CloudWatch

## 🌐 URLs

- **Frontend**: https://brev-ly.uk
- **API**: https://api.brev-ly.uk
- **Documentação**: https://api.brev-ly.uk/docs

## 🚀 Funcionalidades

### ✅ Implementadas

- [x] Encurtamento de URLs com slug personalizado
- [x] **HTTPS automático**: URLs sem protocolo recebem https:// automaticamente
- [x] **Segurança**: URLs HTTP são rejeitadas (apenas HTTPS aceito)
- [x] Listagem de links com paginação
- [x] Contador de visitas
- [x] Redirecionamento automático
- [x] Exclusão de links
- [x] Exportação para CSV
- [x] Interface responsiva com UX otimizada
- [x] API RESTful com documentação Swagger
- [x] Health checks
- [x] SSL/TLS em todos os endpoints
- [x] CORS configurado

## 📡 API Endpoints

### Base URL: `https://api.brev-ly.uk/v1/link`

| Método   | Endpoint         | Descrição                                |
| -------- | ---------------- | ---------------------------------------- |
| `GET`    | `/health`        | Health check                             |
| `POST`   | `/shorten`       | Criar link encurtado                     |
| `GET`    | `/`              | Listar links (paginado)                  |
| `PATCH`  | `/shortUrl/:url` | Obter URL original + incrementar visitas |
| `DELETE` | `/shortUrl/:id`  | Deletar link                             |
| `POST`   | `/export`        | Exportar links para CSV                  |

### Exemplos de uso:

```bash
# Health check
curl https://api.brev-ly.uk/health

# Criar link (HTTPS automático)
curl -X POST https://api.brev-ly.uk/v1/link/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "example.com", "shortUrl": "exemplo"}'
# A API automaticamente converte para: https://example.com

# Criar link com HTTPS explícito (também funciona)
curl -X POST https://api.brev-ly.uk/v1/link/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://github.com/user/repo", "shortUrl": "repo"}'

# ❌ URLs HTTP são rejeitadas
curl -X POST https://api.brev-ly.uk/v1/link/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "http://insecure.com", "shortUrl": "insecure"}'
# Retorna: 400 Bad Request - "URLs HTTP não são permitidas. Use HTTPS apenas."

# Listar links
curl "https://api.brev-ly.uk/v1/link/?page=1&limit=10"

# Redirecionar (incrementa visita)
curl -X PATCH https://api.brev-ly.uk/v1/link/shortUrl/exemplo

# Deletar link
curl -X DELETE https://api.brev-ly.uk/v1/link/shortUrl/exemplo
```

## 🔒 Política de URLs

### ✅ Aceitas automaticamente:

- `example.com` → `https://example.com`
- `github.com/user/repo` → `https://github.com/user/repo`
- `subdomain.site.com.br` → `https://subdomain.site.com.br`
- `https://site.com` → `https://site.com` (mantém como está)

### ❌ Rejeitadas:

- `http://site.com` → **Erro 400**: "URLs HTTP não são permitidas. Use HTTPS apenas."
- `ftp://site.com` → **Erro 400**: URL inválida
- `invalid-url` → **Erro 400**: URL inválida

## 🛠️ Tecnologias

### Frontend

```json
{
  "react": "^18.3.1",
  "typescript": "~5.6.2",
  "@tanstack/react-query": "^5.56.2",
  "tailwindcss": "^3.4.13",
  "vite": "^5.4.8"
}
```

### Backend

```json
{
  "fastify": "^5.0.0",
  "drizzle-orm": "^0.33.0",
  "zod": "^3.23.8",
  "@aws-sdk/client-s3": "^3.658.1"
}
```

## 🏗️ Infraestrutura AWS

### Serviços utilizados:

- **VPC**: Rede privada com subnets públicas e privadas
- **ECS Fargate**: Containers serverless para a API
- **Application Load Balancer**: Balanceamento de carga com SSL
- **CloudFront**: CDN global para o frontend
- **S3**: Armazenamento de assets estáticos
- **Secrets Manager**: Gerenciamento seguro de credenciais
- **CloudWatch**: Logs e monitoramento
- **Auto Scaling**: Escalonamento automático baseado em CPU/memória

### Diagrama de arquitetura:

```
Internet
    │
    ├─── CloudFront ──► S3 (Frontend)
    │        │
    │    CloudFlare DNS
    │        │
    └─── ALB ──► ECS Fargate (API)
             │
         VPC (Private Subnets)
             │
         RDS/Neon (Database)
```

## 🔧 Configuração de Desenvolvimento

### Pré-requisitos

- Node.js 20+
- pnpm
- Docker
- AWS CLI
- Terraform

### Instalação

```bash
# Clone o repositório
git clone https://github.com/gabrielmatsan/brev-ly.git
cd brev-ly

# Backend
cd server
pnpm install
pnpm dev

# Frontend
cd ../web
pnpm install
pnpm dev
```

### Variáveis de ambiente

#### Backend (`.env`)

```env
NODE_ENV=development
DATAPORT=8080
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_ACCESS_KEY_ID=...
CLOUDFLARE_SECRET_ACCESS_KEY=...
CLOUDFLARE_BUCKET=...
CLOUDFLARE_PUBLIC_URL=...
```

#### Frontend (`.env`)

```env
NODE_ENV=development
VITE_FRONTEND_URL=http://localhost:5173
VITE_BACKEND_URL=http://localhost:8080
```

## 🚀 Deploy

### Infraestrutura (Terraform)

```bash
cd terraform

# Configurar variáveis
cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars com seus valores

# Deploy da infraestrutura
terraform init
terraform plan
terraform apply
```

### Aplicação (CI/CD)

O deploy é automático via GitHub Actions:

- **Push para `main`** com mudanças em `server/` → Deploy da API
- **Push para `main`** com mudanças em `web/` → Deploy do Frontend

### Workflows disponíveis:

- `.github/workflows/ci-cd-api.yml` - Deploy da API
- `.github/workflows/ci-cd-front-end.yml` - Deploy do Frontend
- `.github/workflows/pr.yml` - Testes em Pull Requests

## 📊 Monitoramento

### CloudWatch Logs

- **API**: `/ecs/brev-ly`
- **ALB**: `/aws/alb/brev-ly`

### Métricas e Alarmes

- **CPU/Memory do ECS**: Auto scaling configurado
- **Erros do ALB**: Alarme para 5xx errors
- **Health checks**: Monitoramento contínuo

### Health Checks

- **ECS**: `curl -f http://localhost:8080/health`
- **ALB**: `GET /health` (porta 8080)
- **Interval**: 30s, Timeout: 5s, Retries: 3

## 🔐 Segurança

### SSL/TLS

- **Certificados**: AWS Certificate Manager
- **Protocolo**: TLS 1.2+
- **Validação**: DNS via Cloudflare

### Secrets Management

- **Credenciais**: AWS Secrets Manager
- **GitHub Registry**: Secrets para pull de imagens
- **Environment Variables**: Secrets para configuração da aplicação

### Network Security

- **VPC**: Subnets privadas para ECS
- **Security Groups**: Portas específicas (80, 443, 8080)
- **ALB**: Público, ECS privado

## 🐳 Docker

### Imagem de produção

```dockerfile
FROM node:20-alpine AS runner
RUN apk add --no-cache curl
# Multi-stage build para otimização
```

### Características:

- **Base**: Alpine Linux (segura e leve)
- **Tamanho**: ~50MB (otimizada)
- **Health check**: Curl integrado
- **User**: Non-root (1000)

## 📈 Performance

### Frontend

- **CDN**: CloudFront com cache global
- **Compressão**: Gzip/Brotli habilitado
- **HTTP/2**: Suporte completo

### Backend

- **Container**: 512MB RAM, 256 CPU units
- **Auto Scaling**: 0-2 instâncias baseado em CPU/memória
- **Database**: Connection pooling
- **Cache**: Headers otimizados

## 🧪 Testes

### Testar API

```bash
# Health check
curl https://api.brev-ly.uk/health

# Criar link
curl -X POST https://api.brev-ly.uk/v1/link/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com", "shortUrl": "test"}'

# Listar links
curl "https://api.brev-ly.uk/v1/link/?page=1&limit=10"
```

### Testar Frontend

- Acesse: https://brev-ly.uk
- Teste criação de links
- Teste redirecionamento
- Teste listagem e exclusão

## 🔧 Troubleshooting

### Problemas comuns:

#### API retorna 504

- Verificar ECS tasks: `aws ecs describe-services --cluster brev-ly-ecs-cluster --services brev-ly-ecs-service`
- Verificar logs: CloudWatch → `/ecs/brev-ly`

#### Frontend retorna 403

- Verificar CloudFront: Invalidar cache
- Verificar S3: Bucket policy e conteúdo
- Verificar DNS: Cloudflare proxy desabilitado

#### Health check falha

- Verificar logs do container
- Testar endpoint manualmente: `curl https://api.brev-ly.uk/health`
- Verificar task definition

## 📝 Estrutura do Projeto

```
brev-ly/
├── server/                 # Backend API
│   ├── src/
│   │   ├── app.ts         # Configuração do Fastify
│   │   ├── app.routes.ts  # Rotas principais
│   │   ├── link/          # Módulo de links
│   │   └── shared/        # Utilitários compartilhados
│   ├── Dockerfile         # Imagem Docker
│   └── healthcheck.js     # Script de health check
├── web/                   # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Hooks customizados
│   │   └── lib/           # Utilitários e API client
│   └── dist/              # Build de produção
├── terraform/             # Infraestrutura como código
│   ├── *.tf              # Recursos AWS
│   └── terraform.tfvars  # Variáveis de configuração
└── .github/
    ├── workflows/         # CI/CD pipelines
    └── ecs/              # Task definitions
```

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🏆 Tecnologias e Boas Práticas

- ✅ **TypeScript**: Type safety em todo o projeto
- ✅ **Infraestrutura como Código**: Terraform para AWS
- ✅ **CI/CD**: GitHub Actions com deploy automático
- ✅ **Containerização**: Docker multi-stage builds
- ✅ **Monitoramento**: CloudWatch logs e métricas
- ✅ **Segurança**: Secrets Manager, VPC, SSL/TLS
- ✅ **Performance**: CDN, auto scaling, otimizações
- ✅ **Documentação**: Swagger/OpenAPI para API

---

**Desenvolvido por [Gabriel Santos](https://github.com/gabrielmatsan)** 🚀
