// Crea la tabla de asistentes. Uso: node --env-file=.env.local scripts/db-setup.mjs
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS asistentes (
    id          text PRIMARY KEY,
    nombre      text NOT NULL,
    email       text,
    telefono    text,
    nota        text,
    creado_en   timestamptz NOT NULL DEFAULT now()
  )`;

const [{ count }] = await sql`SELECT count(*)::int AS count FROM asistentes`;
console.log(`Tabla lista. Asistentes: ${count}`);
