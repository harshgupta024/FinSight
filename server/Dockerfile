# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S finsight -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

USER finsight

CMD ["node", "server.js"]
