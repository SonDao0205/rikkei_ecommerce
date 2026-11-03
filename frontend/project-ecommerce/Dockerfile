# build frontend React
FROM node:22-alpine AS build
WORKDIR /app

COPY frontend/project-ecommerce/package.json frontend/project-ecommerce/package-lock.json ./
RUN npm ci

ARG VITE_API_BASE_URL
ARG VITE_BACKEND_HOST
ARG VITE_APP_NAME
ARG VITE_APP_ENV
ARG VITE_DEFAULT_AVATAR_SERVICE_URL
ARG VITE_SUPPORT_HOTLINE
ARG VITE_SUPPORT_EMAIL

COPY frontend/project-ecommerce/ ./
RUN npm run build

# build nginx
FROM nginx:alpine
COPY nginx.frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
