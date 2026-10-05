import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;

// Inicialización perezosa: `next build` no debe fallar si falta DATABASE_URL.
export function sql() {
  _sql ??= neon(process.env.DATABASE_URL!);
  return _sql;
}
