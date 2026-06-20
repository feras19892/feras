# syntax=docker/dockerfile:1
FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm@9.0.0
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/api ./apps/api
COPY apps/web ./apps/web
RUN pnpm install
RUN pnpm -F @my-modern-app/api run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]
