# -------- Build Stage --------
FROM node:20-alpine AS builder

WORKDIR /server

# Copy package files first
COPY server/package*.json ./
RUN npm install

# Copy all source files
COPY server .

# Build TypeScript to dist/
RUN npm run build

# -------- Run Stage --------
FROM node:20-alpine

WORKDIR /server

# Copy only necessary files
COPY --from=builder /server/package*.json ./
COPY --from=builder /server/dist ./dist

# Install production dependencies
RUN npm install --omit=dev

# Create non-root user (security best practice)
RUN adduser -D appuser
USER appuser

EXPOSE 3000

# Critical fix: Ensure this matches your actual entry point
CMD ["node", "dist/server.js"]