# syntax=docker/dockerfile:1

# Build stage: repo-based Strapi v5 app build
FROM node:20-bullseye AS build
WORKDIR /app
ENV CI=true \
    NODE_ENV=production \
    STRAPI_TELEMETRY_DISABLED=true
# Install build deps (Debian-based)
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
# Install deps and build admin
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage: minimal image
FROM node:20-bullseye AS runtime
WORKDIR /srv/app
ENV NODE_ENV=production \
    PORT=1337 \
    HOST=0.0.0.0
COPY --from=build /app .
EXPOSE 1337
CMD ["npm","run","start"]
