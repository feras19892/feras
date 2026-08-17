# syntax=docker/dockerfile:1
FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm@9.0.0
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm install --frozen-lockfile
RUN pnpm -F @my-modern-app/api run build
RUN mkdir -p /app/data
ENV NODE_ENV=production
ENV DB_PATH=/app/data/app.db
EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]
