# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS deps
WORKDIR /app
ENV NODE_ENV=development
RUN apk add --no-cache git
COPY packages/backend/package*.json ./
COPY packages/backend/package-lock.json ./
RUN npm install

FROM deps AS build
ENV NODE_ENV=development
COPY packages/backend/tsconfig.json ./
COPY packages/backend/index.html ./
COPY packages/backend/vite.config.ts ./
COPY packages/backend/src ./src
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

RUN apk add --no-cache git
COPY packages/backend/package*.json ./
COPY packages/backend/package-lock.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY packages/backend/.env.example ./.env.example
RUN mkdir -p /data/baileys

EXPOSE 8080
CMD ["node", "dist/server/index.js"]
