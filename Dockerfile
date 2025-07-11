FROM node:alpine

RUN mkdir -p /usr/src/varatiya-app && chown -R node:node /usr/src/varatiya-app

WORKDIR /usr/src/varatiya-app

COPY package.json yarn.lock ./

USER node

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

EXPOSE 3000
 