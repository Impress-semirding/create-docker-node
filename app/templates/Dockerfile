FROM node:10
ENV SASS_BINARY_SITE https://npm.taobao.org/mirrors/node-sass/
COPY ./ /var/www/html
WORKDIR /var/www/html
RUN npm ci --ignore-scripts && \
  npm run deploy && \
  cd ./serverApp && \
  npm ci --ignore-script && \
  cd .. && \
  rm -rf ./node_modules && \
  rm -rf ./src

EXPOSE 8080
CMD ["npm", "run", "serverApp"]
