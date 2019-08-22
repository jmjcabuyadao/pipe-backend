FROM node:10.16-alpine

WORKDIR /usr/app

COPY package.json .

RUN echo "Node Version: " && node --version

RUN echo "NPM Version: " && npm --version 

RUN npm install -g nodemon 
RUN npm install --quiet --no-bin-links

COPY . .