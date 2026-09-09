FROM node:22-alpine

WORKDIR /app

COPY package.json mathbot.mjs ./

RUN mkdir -p /app/data && chown -R node:node /app/data
VOLUME /app/data
ENV MATHBOT_STATE=/app/data/state.json

USER node

CMD ["node", "mathbot.mjs"]
