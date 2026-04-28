# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
COPY packages/backend/package*.json packages/backend/package-lock.json* ./
RUN npm ci
COPY packages/backend/tsconfig.json packages/backend/vite.config.ts ./
COPY packages/backend/src ./src
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
RUN apk add --no-cache git
COPY packages/backend/package*.json packages/backend/package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY packages/backend/.env.example ./.env.example
RUN mkdir -p /data/baileys

EXPOSE 8080
CMD ["node", "dist/server/index.js"]