FROM node:18 as build

ENV NODE_ENV=production

WORKDIR /app

COPY .yarn .yarn
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install

COPY . .
RUN yarn build editor --prod

FROM nginx:alpine
COPY --from=build /app/dist/apps/editor /usr/share/nginx/html
EXPOSE 80
