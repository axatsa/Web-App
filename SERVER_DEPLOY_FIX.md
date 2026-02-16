# Инструкция по развёртыванию на сервере

## Полное развёртывание (API + Bot + Frontend)

Теперь фронтенд будет работать **на том же сервере**, что и API. Cloudflare больше не нужен для хостинга фронтенда.

### 1. Обновите код на сервере

```bash
cd ~/apps/Web-App

# Сохраните .env
cp .env .env.backup

# Уберите локальные изменения
git stash

# Обновите код
git pull

# Восстановите .env
cp .env.backup .env
```

### 2. Проверьте .env

Откройте `.env` и настройте переменные:

```bash
nano .env
```

Должно быть:
```
BOT_TOKEN=ваш_токен_от_botfather
WEBAPP_URL=http://ваш-ip-сервера
```

**Важно:** `WEBAPP_URL` должен указывать на IP вашего сервера или домен (не localhost!), потому что Telegram бот должен знать, куда отправлять пользователей.

Например:
- `WEBAPP_URL=http://123.45.67.89` (если у вас статичный IP)
- `WEBAPP_URL=http://optimizer.example.com` (если настроили домен)

### 3. Запустите все контейнеры

```bash
docker-compose down
docker-compose up --build -d
```

### 4. Проверьте статус

```bash
docker-compose ps
```

Должны быть запущены **3 контейнера**:
```
      Name                     Command               State           Ports
---------------------------------------------------------------------------------
web-app-api_1       python api.py                    Up      0.0.0.0:8000->8000/tcp
web-app-bot-1       python main.py                   Up
web-app-frontend_1  nginx -g daemon off;             Up      0.0.0.0:80->80/tcp
```

### 5. Проверьте логи

```bash
# Все логи
docker-compose logs -f

# Только API
docker-compose logs api

# Только Bot
docker-compose logs bot

# Только Frontend
docker-compose logs frontend
```

### 6. Тестирование

1. **API:**
   ```bash
   curl http://localhost:8000/products
   ```
   Должен вернуть JSON список продуктов.

2. **Frontend:**
   Откройте в браузере: `http://ваш-ip-сервера`
   
3. **Telegram Bot:**
   Напишите `/start` вашему боту в Telegram.

## Важные порты

- **80** - Frontend (веб-интерфейс)
- **8000** - API (для внутреннего использования фронтендом)

Убедитесь, что порт 80 открыт в файрволе сервера для публичного доступа.

## Обновление в будущем

```bash
cd ~/apps/Web-App
git pull
docker-compose down
docker-compose up --build -d
```

