import "server-only";
import { randomBytes } from "node:crypto";
import { cache } from "react";
import { sql } from "@/lib/db";

export type Asistente = {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  nota: string | null;
  creado_en: string;
};

export type DatosAsistente = Pick<Asistente, "nombre" | "email" | "telefono" | "nota">;

function slugify(nombre: string) {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// El sufijo aleatorio evita colisiones entre homónimos y que los links sean adivinables.
// El id no cambia si luego se corrige el nombre, así el link enviado sigue funcionando.
function nuevoId(nombre: string) {
  return `${slugify(nombre).slice(0, 60)}-${randomBytes(3).toString("hex")}`;
}

export async function listarAsistentes() {
  return (await sql()`SELECT * FROM asistentes ORDER BY creado_en DESC`) as Asistente[];
}

/** Página de asistentes en orden de registro (el más antiguo primero), para la API pública. */
export async function paginarAsistentes({ limite, offset, desde }: { limite: number; offset: number; desde: string | null }) {
  const [filas, conteo] = await Promise.all([
    sql()`
      SELECT * FROM asistentes
      WHERE ${desde}::timestamptz IS NULL OR creado_en > ${desde}::timestamptz
      ORDER BY creado_en ASC, id ASC
      LIMIT ${limite} OFFSET ${offset}`,
    sql()`
      SELECT count(*)::int AS total FROM asistentes
      WHERE ${desde}::timestamptz IS NULL OR creado_en > ${desde}::timestamptz`,
  ]);
  return { filas: filas as Asistente[], total: (conteo as { total: number }[])[0].total };
}

export const buscarAsistente = cache(async (id: string) => {
  const filas = (await sql()`SELECT * FROM asistentes WHERE id = ${id}`) as Asistente[];
  return filas[0] ?? null;
});

export async function crearAsistente(d: DatosAsistente) {
  const id = nuevoId(d.nombre);
  await sql()`
    INSERT INTO asistentes (id, nombre, email, telefono, nota)
    VALUES (${id}, ${d.nombre}, ${d.email}, ${d.telefono}, ${d.nota})`;
  return id;
}

export async function actualizarAsistente(id: string, d: DatosAsistente) {
  await sql()`
    UPDATE asistentes
    SET nombre = ${d.nombre}, email = ${d.email}, telefono = ${d.telefono}, nota = ${d.nota}
    WHERE id = ${id}`;
}

export async function eliminarAsistente(id: string) {
  await sql()`DELETE FROM asistentes WHERE id = ${id}`;
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const linkDe = (id: string) => `${SITE_URL}/entrada/${id}`;
