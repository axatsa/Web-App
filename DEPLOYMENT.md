# Deployment Guide

This document explains how to deploy the **Optimizer** project to production.

## 1. Database Setup (Supabase)

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor**.
3. Create a new query and paste the contents of [setup_database.sql](file:///d:/Projects/optimizer/setup_database.sql).
4. Click **Run**.
5. Go to **Project Settings** → **API**.
6. Note down your `Project URL` and `service_role` key (API Key).

## 2. Frontend Deployment (Vercel / Netlify)

Vercel is recommended for the React frontend:

1. Push your code to a GitHub repository.
2. Link the repository to [Vercel](https://vercel.com).
3. Add the following environment variables in Vercel settings:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
4. Deploy the project. Note the URL (e.g., `https://my-optimizer-app.vercel.app`).

## 3. Telegram Bot Setup

1. Message [@BotFather](https://t.me/BotFather) on Telegram.
2. Create a new bot and get the **BOT_TOKEN**.
3. In the bot settings (`/mybots`), click **Bot Settings** → **Menu Button** → **Configure menu button**.
4. Set the URL to your deployed frontend URL (step 2).

## 4. Backend Deployment (Bot on VPS)

The bot must run 24/7 on a server (e.g., DigitalOcean, Hetzner, AWS).

### Using Docker (Recommended)

1. Connect to your VPS via SSH.
2. Install Docker and Docker Compose.
3. Copy the project files to the server.
4. Create a `.env` file from [.env.example](file:///d:/Projects/optimizer/.env.example):
   ```bash
   BOT_TOKEN=...
   SUPABASE_URL=...
   SUPABASE_KEY=... (use service_role key here)
   WEBAPP_URL=... (URL from step 2)
   ```
5. Build and run the container:
   ```bash
   docker build -t optimizer-bot .
   docker run -d --restart always --name optimizer-bot-container --env-file .env optimizer-bot
   ```

### Running manually
1. `pip install -r requirements.txt`
2. `python main.py` (Use `nohup` or `screen` to keep it running).

## 5. Summary Checklist
- [ ] Supabase `users` table created.
- [ ] Frontend URL is HTTPS.
- [ ] Bot token is in `.env`.
- [ ] WebApp URL matches deployed frontend URL.
