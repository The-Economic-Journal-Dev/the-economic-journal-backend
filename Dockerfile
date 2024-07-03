FROM node:20-alpine as development

WORKDIR /usr/src/app

COPY package*.json .

ENV NODE_ENV=development

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine as production

WORKDIR /usr/src/app

COPY package*.json .

ENV NODE_ENV=production

RUN npm ci --omit=dev

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/public ./public

USER node

EXPOSE 3000

CMD ["node", "dist/app.js"]