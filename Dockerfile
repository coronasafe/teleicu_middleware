FROM node:17-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
#RUN npm ci

COPY . .

RUN chmod +x ./start.sh

EXPOSE 8090

ENTRYPOINT [ "./start.sh" ]
