FROM node:22-alpine

WORKDIR /app

COPY package.json mathbot.mjs ./

USER node

CMD ["node", "mathbot.mjs"]
