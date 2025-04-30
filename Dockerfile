FROM --platform=linux/amd64 node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
EXPOSE 3002
CMD ["node", "./src/App.js"]
