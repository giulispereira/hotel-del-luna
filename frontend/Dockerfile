FROM node:24-slim AS base
WORKDIR /app
COPY package*.json ./

FROM base AS dev
RUN npm install
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM base AS prod-deps
RUN npm install

FROM base AS build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm install
# Copia todos os arquivos do projeto (incluindo svelte.config.js e vite.config.js)
COPY . .
RUN npm run build

FROM node:24-slim AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY package*.json ./

EXPOSE 3000
CMD ["node", "build/index.js"]