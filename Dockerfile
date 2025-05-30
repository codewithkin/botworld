# -------- Build Stage --------
FROM node:20-alpine AS builder

# Set working directory for build
WORKDIR /server

# Copy only the server folder into the image
COPY server/package*.json ./
RUN npm install

COPY server .

# Build the TypeScript app
RUN npm run build

# -------- Run Stage --------
FROM node:20-alpine

# Working directory in runtime container
WORKDIR /server

# Copy built code and package files from builder
COPY --from=builder /server/dist ./dist
COPY --from=builder /server/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Expose the port your server uses (e.g., 3000)
EXPOSE 3000

# Start the app
CMD ["node", "dist/server.js"]