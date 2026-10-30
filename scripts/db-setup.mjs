// Crea la tabla de asistentes. Uso: node --env-file=.env.local scripts/db-setup.mjs
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS asistentes (
    id          text PRIMARY KEY,
    nombre      text NOT NULL,
    tipo        text NOT NULL DEFAULT 'premium' CHECK (tipo IN ('premium', 'pro')),
    email       text,
    telefono    text,
    nota        text,
    creado_en   timestamptz NOT NULL DEFAULT now()
  )`;

await sql`
  ALTER TABLE asistentes
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'premium'`;

await sql`
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'asistentes_tipo_check'
    ) THEN
      ALTER TABLE asistentes
      ADD CONSTRAINT asistentes_tipo_check CHECK (tipo IN ('premium', 'pro'));
    END IF;
  END $$`;

const conteos = await sql`
  SELECT tipo, count(*)::int AS count
  FROM asistentes
  GROUP BY tipo
  ORDER BY tipo`;
console.log("Tabla lista. Asistentes por tipo:", conteos);
