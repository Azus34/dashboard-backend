FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Si es NestJS → compila
RUN npm run build

EXPOSE 3000

CMD ["node", "server.js"]
