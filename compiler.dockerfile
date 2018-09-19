FROM docker:latest
MAINTAINER Mario Souto
COPY . /var/www
WORKDIR /var/www
ENV PORT=3000 
RUN apk --no-cache add sudo
RUN apk --no-cache add shadow
RUN sudo groupadd docker
RUN sudo usermod -aG docker $(whoami)
RUN apk add --update nodejs nodejs-npm
RUN npm install
ENTRYPOINT npm start
EXPOSE $PORT 

