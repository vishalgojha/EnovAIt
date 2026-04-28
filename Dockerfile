# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache git
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/backend/package-lock.json* ./packages/backend/
RUN npm ci --workspaces

FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm run build -w enovait-backend

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
RUN apk add --no-cache git
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/backend/package-lock.json* ./packages/backend/
RUN npm ci --workspaces --omit=dev && npm cache clean --force

COPY --from=build /app/packages/backend/dist ./packages/backend/dist
COPY packages/backend/.env.example ./.env.example
RUN mkdir -p /data/baileys

EXPOSE 8080
CMD ["node", "packages/backend/dist/server/index.js"]