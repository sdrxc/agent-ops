#FROM node:22-alpine AS deps
FROM public.ecr.aws/docker/library/node:22-alpine3.21 AS deps
WORKDIR /app

# Install dependencies (with lockfile) for reproducible builds
COPY package*.json ./
RUN apk add --no-cache libc6-compat \
  && npm ci --legacy-peer-deps

# Build stage
FROM public.ecr.aws/docker/library/node:22-alpine3.21 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production runtime image
FROM public.ecr.aws/docker/library/node:22-alpine3.21 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Install only production dependencies
COPY package*.json ./
RUN apk add --no-cache libc6-compat \
  && npm ci --omit=dev --legacy-peer-deps

# Copy built assets and required runtime files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/postcss.config.js ./postcss.config.js
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3000
CMD ["npm", "start"]