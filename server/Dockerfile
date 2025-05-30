# -------- Build Stage --------
FROM node:20-alpine AS builder

# Set working directory in container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the server source code
COPY . .

# Build TypeScript project
RUN npm run build

# -------- Run Stage --------
FROM node:20-alpine

WORKDIR /app

# Copy only needed files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production deps
RUN npm install --omit=dev

# Expose the port your app uses (adjust if needed)
EXPOSE 8080

# Start your app
CMD ["node", "dist/server.js"]