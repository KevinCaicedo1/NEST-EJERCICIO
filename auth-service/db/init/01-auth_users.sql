-- Opcional: UUID por defecto (recomendado para simplificar inserts)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (mínima)
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         varchar(320) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role          text NOT NULL DEFAULT 'USER',
  created_at    timestamptz NOT NULL DEFAULT NOW(),
  updated_at    timestamptz NOT NULL DEFAULT NOW()
);
