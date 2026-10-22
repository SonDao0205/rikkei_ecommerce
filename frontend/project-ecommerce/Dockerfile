# build frontend React
FROM node:22-alpine AS build
WORKDIR /app

COPY frontend/project-ecommerce/package.json frontend/project-ecommerce/package-lock.json ./
RUN npm ci

COPY frontend/project-ecommerce/ ./
RUN npm run build

# build nginx
FROM nginx:alpine
COPY nginx.frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]