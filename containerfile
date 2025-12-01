# Build Stage
FROM node:24-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Stage
FROM node:24-alpine AS production-stage

WORKDIR /app

COPY --from=build-stage /app/.output ./.output
COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/server/database/migrations ./server/database/migrations
COPY --from=build-stage /app/package*.json ./
COPY --from=build-stage /app/drizzle.config.ts ./
COPY --from=build-stage /app/run.sh ./

RUN mkdir -p ./.data
RUN chmod +x ./run.sh

RUN apk add --no-cache \
    udev \
    ttf-freefont \
    chromium

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

ENTRYPOINT ["./run.sh"]