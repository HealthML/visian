FROM node:18 as build

ENV NODE_ENV=production

WORKDIR /app

COPY .yarn .yarn
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install

COPY . .
ARG NX_ANNOTATION_SERVICE_HUB_URL
RUN yarn build editor --prod

FROM nginx:alpine
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/apps/editor /usr/share/nginx/html
EXPOSE 80
