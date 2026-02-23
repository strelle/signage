# syntax=docker/dockerfile:1

# Build stage: create a Strapi v5 app and build admin
FROM node:20-alpine AS build
WORKDIR /app
ENV CI=true \
    NODE_ENV=production
# Create empty app folder and initialize Strapi app
RUN corepack enable && apk add --no-cache git python3 make g++
# Use create-strapi-app to scaffold into /app
RUN npx create-strapi-app@latest . --no-run --quickstart || npx create-strapi-app@latest . --no-run
# Install deps (include dev for admin build) and build admin
RUN npm ci && npm run build

# Runtime stage: minimal image
FROM node:20-alpine AS runtime
WORKDIR /srv/app
ENV NODE_ENV=production \
    PORT=1337 \
    HOST=0.0.0.0
COPY --from=build /app .
# Expose Strapi port (internal only; reverse proxy terminates TLS)
EXPOSE 1337
CMD ["npm","run","start"]
