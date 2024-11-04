FROM node:22 AS base
WORKDIR /usr/src/app
RUN npm install -g bun

COPY package*.json bun.lockb ./
RUN bun install
COPY . .

ENV NODE_ENV production
RUN bun run build-docker

CMD [ "bun", "build/index.js" ]