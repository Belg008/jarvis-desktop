# Multi-stage build for JARVIS Desktop (web preview)
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage - serve static files
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/dist-electron /usr/share/nginx/html/electron
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
