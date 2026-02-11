# Deployment Guide (Local Architecture)

This document explains how to deploy the **Optimizer** project using the local FastAPI backend and SQLite database.

## 1. Environment Configuration

Create a `.env` file in the root directory:
```bash
BOT_TOKEN=your_bot_token
WEBAPP_URL=http://your-server-ip:5173
DB_PATH=database.db
```

## 2. Backend & Bot Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the API server**:
   ```bash
   python api.py
   ```
   (API runs on `http://localhost:8000`)

3. **Start the Telegram Bot**:
   ```bash
   python main.py
   ```

## 3. Frontend Deployment

1. **Build and Run**:
   ```bash
   npm install
   npm run dev
   ```

## 4. Summary Checklist
- [x] Local SQLite `database.db` is used.
- [x] `api.py` handles frontend requests.
- [x] `main.py` handles Telegram Bot.
