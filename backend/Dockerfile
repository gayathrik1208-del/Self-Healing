# ---- Backend Dockerfile (Node.js / Express) ----
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --production

# Copy the rest of the backend source
COPY . .

# Backend listens on this port (match your Express app's PORT)
EXPOSE 5000

# Simple healthcheck hitting an /api/health (or similar) route
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
