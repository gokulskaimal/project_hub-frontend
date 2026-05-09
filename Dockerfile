# Install dependencies

FROM node:22.14.0-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm install

# Build the Next.js app

FROM node:22.14.0-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build

# Run the Next.js app

FROM node:22.14.0-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]