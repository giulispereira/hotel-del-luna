FROM node:24-slim AS base
WORKDIR /app

# bcrypt has a native Node addon; provide a compiler toolchain for npm installs.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

FROM base AS dev
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=development
EXPOSE 3001
CMD ["npm", "run", "dev"]

FROM base AS prod-deps
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:24-slim AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node server.js ./server.js
USER node
EXPOSE 3001
CMD ["node", "server.js"]