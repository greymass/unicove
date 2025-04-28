FROM node:22 AS base
WORKDIR /usr/src/app
RUN npm install -g bun

COPY package*.json bun.lock ./
COPY Makefile ./
RUN bun install --frozen-lockfile
COPY . .

ENV NODE_ENV production
RUN apt -y install make ca-certificates
RUN make build/docker

CMD [ "bun", "build/index.js" ]