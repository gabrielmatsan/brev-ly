FROM node:20.18 AS base
RUN npm i -g pnpm
#################
FROM base AS dependencies
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
#################
FROM base AS build
WORKDIR /usr/src/app
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .
RUN pnpm build
RUN rm -rf node_modules
RUN pnpm install --prod --frozen-lockfile
#################
FROM node:20-alpine AS runner
WORKDIR /usr/src/app
USER 1000
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package.json ./package.json
EXPOSE 8080
CMD ["dist/app.js"]