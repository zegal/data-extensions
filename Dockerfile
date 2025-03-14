# Set the base image to Node
FROM node:22.13.0-alpine
LABEL MAINTAINER ANTHONY MICHEL "anthony.michel@zegal.com"

# Define working directory
WORKDIR /app

COPY package.json .
RUN npm install

COPY . .
RUN mkdir src/log \
  && touch src/log/auth-gateway.log

EXPOSE 8000
CMD ["node", "./src/app.js"]