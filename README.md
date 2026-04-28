# Leaf Diagnosis

Веб-приложение для анализа состояния растений по фотографии листа с формированием рекомендаций по уходу.

## Стек

- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, Alembic
- **Frontend:** React, TypeScript, Vite
- **AI:** PlantNet API (идентификация растения), Ollama Qwen2.5 (анализ симптомов и рекомендации)
- **Инфраструктура:** Docker, Docker Compose

## Запуск

### Требования

- Docker и Docker Compose
- PlantNet API ключ ([my-api.plantnet.org](https://my-api.plantnet.org))

### Настройка

Создать файл `backend/.env` на основе `backend/.env.example`:

```env
SECRET_KEY=your_secret_key
PLANTNET_API_KEY=your_plantnet_key
DATABASE_URL=postgresql+psycopg2://postgres:postgres@postgres:5432/leaf_diagnosis
OLLAMA_URL=http://ollama:11434/api/generate
```

### Запуск через Docker Compose

```bash
docker compose up --build
```

После запуска:
- Фронтенд: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:8000](http://localhost:8000)
- Документация API: [http://localhost:8000/docs](http://localhost:8000/docs)

### Загрузка модели Ollama

После первого запуска выполни:

```bash
docker exec -it leaf_diagnosis-ollama-1 ollama pull qwen2.5:7b
```

## Тесты

```bash
cd backend
python -m pytest tests/
```

## Функциональность

1. Регистрация и авторизация пользователей
2. Загрузка фото растения → идентификация вида через PlantNet
3. Выбор симптомов и зоны поражения → анализ через Ollama Qwen2.5
4. Итоговое заключение: статус, возможные причины, рекомендации
5. История анализов для авторизованных пользователей
