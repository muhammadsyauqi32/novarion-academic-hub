FROM node:20-alpine AS base

WORKDIR /app

# Copy root workspace configurations
COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY apps/worker/package.json ./apps/worker/

# Install dependencies
RUN npm ci

# Copy source codes
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db
COPY apps/worker ./apps/worker

# Build worker
WORKDIR /app/apps/worker
RUN npm run build

ENV NODE_ENV=production
CMD ["npm", "start"]
