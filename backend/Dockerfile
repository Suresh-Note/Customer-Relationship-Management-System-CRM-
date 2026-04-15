# ── Backend Dockerfile ────────────────────────────────────────
# Multi-stage: install deps → production image
#
# Build:  docker build -t crm-backend ./backend
# Run:    docker run -p 5000:5000 --env-file ./backend/.env crm-backend

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY package.json ./
COPY server.js ./
COPY src/ ./src/
COPY migrations/ ./migrations/

# Non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup
USER appuser

EXPOSE 5000
CMD ["node", "server.js"]
