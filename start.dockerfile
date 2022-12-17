FROM node:18.11.0



WORKDIR /app
COPY . .
RUN npm install
ENTRYPOINT [ "npm", "run", "start" ]