
FROM node:24-slim AS base
WORKDIR /app
COPY package*.json ./


FROM base AS dev
RUN npm install
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


FROM base AS build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm ci
COPY . .
RUN npm run build


FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]