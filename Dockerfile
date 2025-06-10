# Базовий образ для розробки
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Базовий образ для production
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"] 