# Trade App Backend

## Вимоги
- Docker
- Docker Compose

## Встановлення та запуск

1. Клонуйте репозиторій:
```bash
git clone <url-репозиторію>
cd trade-app-backend
```

2. Створіть файл `.env` на основі `.env.example`:
```bash
cp .env.example .env
```

3. Відредагуйте `.env` файл, встановивши необхідні значення:
- `MONGODB_URI` - URL для підключення до MongoDB
- `BYBIT_API_KEY` - ваш API ключ Bybit
- `BYBIT_API_SECRET` - ваш секретний ключ Bybit
- Інші необхідні змінні середовища

4. Запустіть проект через Docker Compose:
```bash
# Збірка та запуск контейнерів
docker-compose up --build

# Або для запуску в фоновому режимі
docker-compose up -d
```

5. Перевірте, що всі контейнери запущені:
```bash
docker-compose ps
```

## Доступні ендпоінти

Після запуску, API буде доступне за адресою: `http://localhost:3000`

## Зупинка проекту

Для зупинки проекту виконайте:
```bash
docker-compose down
```

## Логи

Для перегляду логів:
```bash
# Всі логи
docker-compose logs

# Логи конкретного сервісу
docker-compose logs app
docker-compose logs mongodb

# Логи в реальному часі
docker-compose logs -f
```

## Розробка

Для розробки ви можете використовувати:
```bash
# Запуск в режимі розробки
docker-compose -f docker-compose.dev.yml up
```

## Вирішення проблем

1. Якщо порт 3000 вже використовується:
   - Змініть порт в `docker-compose.yml`
   - Або зупиніть процес, який використовує порт

2. Якщо виникають проблеми з MongoDB:
   - Перевірте, чи не використовується порт 27017
   - Перевірте права доступу до директорії з даними

3. Якщо контейнери не запускаються:
   - Перевірте логи: `docker-compose logs`
   - Перевірте наявність всіх необхідних змінних середовища
