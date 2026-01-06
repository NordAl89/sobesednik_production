# Sobesednik Production

Production-репозиторий проекта «Собеседник на час».

Репозиторий используется **непосредственно для деплоя на сервер**  
и является единственным источником актуального production-кода.

---

## Структура проекта

/backend — Node.js API (PM2 process: sobesednik-backend)
/frontend — Nuxt 3 SSR (PM2 process: sobesednik-frontend)


> В корне проекта **нет package.json** — все npm-команды выполняются
> строго в `backend/` или `frontend/`.

---

## Деплой (production)
⚠️ Любые изменения на сервере выполняются только через Git.
Ручные правки файлов без коммита запрещены.
Все действия выполняются **на сервере** в `/var/www/sobesednik`.
Изменения в production вносятся только через pull / push в ветку main.
### Обновление кода
```bash
git pull origin main

cd backend
npm install
pm2 restart sobesednik-backend

cd frontend
npm install
npm run build
pm2 restart sobesednik-frontend

## PM2

Процессы:
- backend: sobesednik-backend
- frontend: sobesednik-frontend

Сохранение состояния:
pm2 save

Восстановление после перезагрузки сервера:
pm2 resurrect

-------------------------------------

ВАЖНО: что не хранится в Git

Следующие данные никогда не коммитятся:

backend/uploads/ — пользовательские файлы (runtime)

node_modules/

.output, .nuxt, dist

*.tar.gz — архивы и бэкапы

.env файлы

См. .gitignore.
