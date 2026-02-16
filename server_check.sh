#!/bin/bash
# Скрипт для диагностики проблем на сервере

echo "=== Проверка статуса контейнеров ==="
docker-compose ps

echo ""
echo "=== Логи API сервера ==="
docker-compose logs api --tail=50

echo ""
echo "=== Логи бота ==="
docker-compose logs bot --tail=50

echo ""
echo "=== Проверка подключения к API ==="
curl http://localhost:8000/products

echo ""
echo "=== Количество продуктов в БД ==="
docker-compose exec api python -c "import sqlite3; conn = sqlite3.connect('database.db'); cursor = conn.cursor(); cursor.execute('SELECT COUNT(*) FROM master_products'); print(f'Products: {cursor.fetchone()[0]}'); conn.close()"
