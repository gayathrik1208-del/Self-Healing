# ---- Frontend Dockerfile (React, multi-stage build) ----

# Stage 1: build the React app
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# For Create React App this outputs to /app/build
# For Vite this outputs to /app/dist -> change the COPY path below accordingly
RUN npm run build

# Stage 2: serve the static build with Nginx
FROM nginx:alpine

# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from the build stage
# CRA -> /app/build | Vite -> /app/dist
COPY --from=build /app/build /usr/share/nginx/html

# Custom Nginx config (handles React Router client-side routes)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
