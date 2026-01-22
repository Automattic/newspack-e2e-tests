FROM node:22-bullseye

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ARG node_memory=16384

COPY package.json package-lock.json /tmp/

WORKDIR /tmp

RUN apt-get update && apt-get install -y sshpass

RUN npm ci && \
  npx playwright install chromium --with-deps && \
  rm -rf /tmp/node_modules