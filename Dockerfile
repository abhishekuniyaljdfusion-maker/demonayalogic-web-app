# ──────────────────────────────────────────────────────────────
#  Nayalogic OS — Dockerfile for Back4App / Container Hosting
# ──────────────────────────────────────────────────────────────
#  Multi-stage build: smaller final image, faster deploys.
#  Uses npm install (not npm ci) to handle lock file mismatches.
#  Memory-optimized for free-tier container hosts.
# ──────────────────────────────────────────────────────────────

# ---------- Stage 1: Dependencies ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files + prisma schema first (better layer caching)
# prisma/ is needed because postinstall runs "prisma generate"
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm install --omit=dev

# ---------- Stage 2: Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Limit Node.js memory to prevent OOM on free-tier builds
ENV NODE_OPTIONS="--max-old-space-size=1536"

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js (output: "standalone" is set in next.config.ts)
RUN npm run build

# ---------- Stage 3: Production ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Limit memory in production too (free tier)
ENV NODE_OPTIONS="--max-old-space-size=512"

# Create db directory for SQLite
RUN mkdir -p /app/db

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
# Copy static assets & public folder
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma schema for db push on first run
COPY --from=builder /app/prisma ./prisma
# Copy the db lib (needed by instrumentation for auto-seed)
COPY --from=builder /app/src/lib/db.ts ./src/lib/db.ts
# Copy instrumentation hook for auto-seed on boot
COPY --from=builder /app/instrumentation.ts ./instrumentation.ts
# Copy .env.example so start.js can create .env
COPY --from=builder /app/.env.example ./.env.example
# Copy start.js bootstrapper
COPY --from=builder /app/start.js ./start.js

EXPOSE 3000

CMD ["node", "start.js"]
