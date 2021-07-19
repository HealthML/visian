FROM node as build

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --pure-lockfile

COPY . .
ARG app
RUN yarn build $app --prod --skip-nx-cache \
  && mv /app/dist/apps/$app /dist

FROM nginx
COPY --from=build /dist /usr/share/nginx/html
