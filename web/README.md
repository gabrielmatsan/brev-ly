# Brev.ly - Frontend

Uma aplicação React para gerenciamento de URLs encurtadas, desenvolvida com Vite, TypeScript e Tailwind CSS.

## 🚀 Funcionalidades

### Implementadas

- [x] Deve ser possível criar um link
  - [x] Não deve ser possível criar um link com encurtamento mal formatado
  - [x] Não deve ser possível criar um link com encurtamento já existente
- [x] Deve ser possível deletar um link
- [x] Deve ser possível obter a URL original por meio do encurtamento
- [x] Deve ser possível listar todas as URL's cadastradas
- [x] Deve ser possível incrementar a quantidade de acessos de um link
- [x] Deve ser possível baixar um CSV com o relatório dos links criados

### Regras Específicas do Frontend

- [x] Aplicação React no formato SPA utilizando o Vite como bundler
- [x] Layout responsivo e moderno
- [x] Elementos de UX (empty state, ícones de carregamento, bloqueio de ações)
- [x] Foco na responsividade para desktop e mobile

## 📱 Páginas

1. **Página Raiz (`/`)**: Formulário de cadastro e listagem dos links
2. **Página de Redirecionamento (`/:url-encurtada`)**: Busca e redireciona para a URL original
3. **Página 404 (`*`)**: Exibida para URLs inválidas ou não encontradas

## 🛠️ Tecnologias

### Obrigatórias

- ✅ **TypeScript**: Tipagem estática
- ✅ **React**: Biblioteca de interface
- ✅ **Vite**: Bundler e ferramenta de desenvolvimento

### Opcionais (Utilizadas)

- ✅ **TailwindCSS**: Framework CSS utilitário
- ✅ **React Query (@tanstack/react-query)**: Gerenciamento de estado servidor
- ✅ **React Hook Form**: Gerenciamento de formulários
- ✅ **Zod**: Validação de schemas
- ✅ **React Router DOM**: Roteamento

## 🔧 Configuração

### Variáveis de Ambiente

Copie o arquivo `.env.example` e configure:

```bash
cp .env.example .env.local
```

```env
VITE_FRONTEND_URL=http://localhost:5173
VITE_BACKEND_URL=http://localhost:3000
```

### Instalação

```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Preview da build
pnpm preview
```

## 🏗️ Estrutura do Projeto

```
src/
├── hooks/           # Custom hooks (React Query)
├── lib/            # Configurações e utilitários
│   ├── api.ts      # Cliente da API
│   ├── env.ts      # Validação de variáveis de ambiente
│   ├── query-client.ts # Configuração React Query
│   └── types.ts    # Tipos TypeScript
├── pages/          # Páginas da aplicação
│   ├── Home.tsx    # Página principal
│   ├── Redirect.tsx # Redirecionamento
│   └── NotFound.tsx # Página 404
├── App.tsx         # Configuração de rotas
└── main.tsx        # Ponto de entrada
```

## 🎨 Design

- **Mobile First**: Desenvolvido priorizando dispositivos móveis
- **Sistema de Design**: Baseado em componentes reutilizáveis
- **Acessibilidade**: Focus management e semantic HTML
- **Estados de Loading**: Indicadores visuais para todas as operações
- **Feedback Visual**: Mensagens de erro e sucesso claras

## 🔗 Integração com API

A aplicação se integra com uma API REST que fornece:

- `POST /shorten`: Criar link encurtado
- `GET /`: Listar links com paginação
- `DELETE /shortUrl/:id`: Deletar link
- `PATCH /shortUrl/:url`: Obter URL original e incrementar visitas
- `POST /export`: Exportar relatório em CSV

## 📋 Funcionalidades de UX

### Estados da Interface

- **Loading States**: Spinners e skeleton screens
- **Empty States**: Mensagens quando não há dados
- **Error States**: Tratamento visual de erros
- **Confirmation Dialogs**: Para ações destrutivas

### Interações

- **Copy to Clipboard**: Copiar links encurtados
- **Auto-redirect**: Redirecionamento automático
- **Pagination**: Navegação entre páginas de links
- **Form Validation**: Validação em tempo real

### Responsividade

- **Mobile**: Layout otimizado para telas pequenas
- **Tablet**: Adaptação para telas médias
- **Desktop**: Aproveitamento do espaço disponível

## 🚀 Deploy

Para fazer o deploy da aplicação:

```bash
# Build da aplicação
pnpm build

# Os arquivos estarão na pasta dist/
```

Configure as variáveis de ambiente no seu provedor de hospedagem com as URLs de produção.

---

Desenvolvido como parte do Desafio Rocketseat 🚀
