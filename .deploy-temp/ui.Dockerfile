FROM node:20-alpine AS deps
WORKDIR /app
COPY packages/ui/package*.json ./
RUN npm install --legacy-peer-deps

FROM deps AS build
COPY packages/ui ./
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY packages/ui/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY packages/ui/server.mjs ./
EXPOSE 3000
CMD ["node", "server.mjs"]
