# ──────────────────────────────────────────────────────────────
#  Nayalogic OS — Dockerfile for Back4App Containers
# ──────────────────────────────────────────────────────────────
#  Optimized for Back4App free plan:
#    - Single-stage build (more reliable, less OOM risk)
#    - Uses npm install (handles lock file mismatches)
#    - Memory-limited Node.js during build
#    - Exposes TCP port 3000 (Back4App requirement)
# ──────────────────────────────────────────────────────────────

FROM node:20-alpine

WORKDIR /app

# Install OS-level compat libraries needed by Next.js / sharp
RUN apk add --no-cache libc6-compat

# Limit Node memory during build to prevent OOM on free plan
ENV NODE_OPTIONS="--max-old-space-size=1536"

# Copy package files + prisma schema first
# (prisma/ is required because postinstall runs "prisma generate")
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Install all dependencies
RUN npm install

# Copy all source code
COPY . .

# Generate Prisma client and build Next.js
RUN npx prisma generate
RUN npm run build

# ─── Production Runtime Settings ───
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_OPTIONS=""

# Create directory for SQLite database
RUN mkdir -p db

# Back4App requires an exposed TCP port for traffic routing
EXPOSE 3000

# start.js handles: .env creation, prisma db push, server start
CMD ["node", "start.js"]
