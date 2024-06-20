FROM node:20-alpine as development

WORKDIR /usr/src/app

COPY package*.json .

ENV NODE_ENV=development

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci  --only=production

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/app.js"]