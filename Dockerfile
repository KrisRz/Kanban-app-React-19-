FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Database URL will be set at runtime
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Build application
RUN npm run build:nolint

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Pass through the database URL to the runtime environment
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Create system user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built app
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/data ./data

# Make scripts executable
RUN chmod +x ./scripts/render-start.js

# Ensure pg module is installed for the database scripts (before switching to nextjs user)
RUN npm install pg --no-save

USER nextjs

EXPOSE 3000

ENV PORT 3000
# Add environment variable to control connection retry behavior
ENV DB_MAX_RETRIES 1
ENV DB_CONNECTION_TIMEOUT 10000

# Use our custom startup script instead of directly running server.js
CMD ["node", "scripts/render-start.js"] 