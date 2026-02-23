# syntax=docker/dockerfile:1

# Build stage: create a Strapi v5 app and build admin
FROM node:20-alpine AS build
WORKDIR /app
ENV CI=true \
    NODE_ENV=production \
    STRAPI_TELEMETRY_DISABLED=true \
    npm_config_yes=true
# Tooling for native deps
RUN corepack enable && apk add --no-cache git python3 make g++
# Scaffold Strapi app non-interactive
RUN npx --yes create-strapi-app@latest . --no-run --quickstart || npx --yes create-strapi-app@latest . --no-run
# Install deps (dev deps included for admin build) and build admin
RUN npm install && npm run build

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
