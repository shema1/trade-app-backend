# Базовий образ для розробки
FROM node:18-alpine AS development

WORKDIR /app

# Встановлюємо необхідні залежності для компіляції
RUN apk add --no-cache python3 make g++ gcc

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

# Базовий образ для production
FROM node:18-alpine AS production

WORKDIR /app

# Встановлюємо необхідні залежності для компіляції
RUN apk add --no-cache python3 make g++ gcc

COPY package*.json ./

# Спочатку встановлюємо всі залежності для збірки
RUN npm install --legacy-peer-deps

COPY . .

# Збираємо проект
RUN npm run build

# Видаляємо dev-залежності
RUN npm prune --production

EXPOSE 3000

CMD ["npm", "run", "start:prod"] 