FROM node:22-bookworm-slim

RUN corepack enable

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN chmod +x /app/docker/entrypoint.sh

EXPOSE 5173

ENTRYPOINT ["/app/docker/entrypoint.sh"]
CMD ["yarn", "dev", "--host", "0.0.0.0", "--port", "5173"]
