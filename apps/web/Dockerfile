# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@9.0.0
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/web ./apps/web
COPY apps/api ./apps/api
RUN pnpm install
RUN pnpm -F @my-modern-app/web run build

FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
