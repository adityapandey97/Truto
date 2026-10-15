# Multi-stage production Dockerfile for CodePilot AI Backend
FROM node:22-alpine AS base

WORKDIR /usr/src/app

# Install dependencies needed for native modules (e.g., bcrypt)
RUN apk add --no-cache python3 make g++

COPY package*.json ./

# Production dependency installation
FROM base AS dependencies
RUN npm ci --omit=dev

# Final runtime image
FROM node:22-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5000

# Copy node_modules from dependencies stage
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/

EXPOSE 5000

# Health check probe against Express /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
