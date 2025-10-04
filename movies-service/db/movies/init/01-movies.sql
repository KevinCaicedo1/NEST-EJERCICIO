-- Extensión opcional para UUID v4 (si prefieres generarlos en DB)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS movies (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  swapi_id       integer UNIQUE,              -- null si es película creada manualmente
  title          text NOT NULL,
  episode_id     integer,
  opening_crawl  text,
  director       text,
  producer       text,
  release_date   date,
  created_at     timestamptz NOT NULL DEFAULT NOW(),
  updated_at     timestamptz NOT NULL DEFAULT NOW()
);

-- Índices útiles (opcionales pero recomendados)
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies (release_date);
CREATE INDEX IF NOT EXISTS idx_movies_title_lower ON movies ((lower(title)));
