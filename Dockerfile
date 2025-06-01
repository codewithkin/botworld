# -------- Build Stage --------
FROM node:20-alpine AS builder

WORKDIR /server
COPY server/package*.json .
RUN npm install
COPY server .

# Build will now output to /server instead of /server/dist
RUN npm run build

# -------- Run Stage --------
FROM node:20-alpine
WORKDIR /server

# Copy built files directly from root
COPY --from=builder /server/package*.json .
COPY --from=builder /server/server.js .
COPY --from=builder /server/src/views ./src/views
COPY --from=builder /server/public ./public

RUN npm install --omit=dev

EXPOSE 3000
CMD ["node", "server.js"]  # Simplified path