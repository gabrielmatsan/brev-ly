#Imagem base
FROM node:20.18 AS base
#Instala o pnpm globalmente
RUN npm i -g pnpm

#Imagem de dependências
FROM base AS dependencies
#Diretório de trabalho
WORKDIR /usr/src/app
#Copia o package.json e o pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./
#Instala as dependências
RUN pnpm install --frozen-lockfile

#Imagem de build
FROM base AS build
WORKDIR /usr/src/app
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .
RUN pnpm build
RUN rm -rf node_modules
RUN pnpm install --prod --frozen-lockfile

#Imagem de runner
FROM gcr.io/distroless/nodejs20-debian12 AS runner
WORKDIR /usr/src/app
USER 1000
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package.json ./package.json
EXPOSE 8080
CMD ["dist/app.js"]