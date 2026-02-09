-- Create users table for Telegram Bot registration flow
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    telegram_id BIGINT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (
        role IN (
            'chef',
            'financier',
            'supplier'
        )
    ),
    branch TEXT CHECK (
        branch IN (
            'chilanzar',
            'uchtepa',
            'shayzantaur',
            'olmazar'
        )
    ),
    language TEXT NOT NULL DEFAULT 'ru' CHECK (language IN ('ru', 'uz')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookup by telegram telegram_id
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users (telegram_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Simple policy: authenticated users can read all data (adjust as needed for production)
CREATE POLICY "Enable read access for all users" ON users FOR
SELECT USING (true);

-- Policy: Allow service role to manage all data
CREATE POLICY "Allow all for service_role" ON users FOR ALL USING (auth.role () = 'service_role');