# -------- Build Stage --------
FROM node:20-alpine AS builder

WORKDIR /app
COPY server/package*.json .
RUN npm install
COPY server .

# Build will now output to /app instead of /app/dist
RUN npm run build

# -------- Run Stage --------
FROM node:20-alpine
WORKDIR /app

# Copy built files directly from root
COPY --from=builder /app/package*.json .
COPY --from=builder /app/server.js .
COPY --from=builder /app/src/views ./src/views
COPY --from=builder /app/public ./public

RUN npm install --omit=dev

EXPOSE 3000
CMD ["node", "server.js"]  # Simplified path