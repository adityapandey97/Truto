# Multi-stage production build for CodePilot AI Frontend
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Nginx server
FROM nginx:alpine AS runner
COPY --from=build /app/dist /usr/share/nginx/html

# Custom Nginx configuration for single page application (SPA) routing
RUN echo 'server { \
  listen 5173; \
  location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
