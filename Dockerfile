# Dockerfile

FROM node:16.15-alpine3.14
ENV CONNECTION_URL 'mongodb://mongo:27017/kata'
RUN mkdir -p /opt/app
WORKDIR /opt/app
RUN adduser -S app
COPY . .
RUN npm install
RUN chown -R app /opt/app
USER app
EXPOSE 3000 27017
CMD [ "npm", "run", "start" ]
