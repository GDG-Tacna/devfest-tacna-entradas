import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { linkDe, SITE_URL, type Asistente } from "@/lib/asistentes";

// API_KEYS admite varias claves separadas por coma: una por integración, para poder revocarlas por separado.
function clavesValidas() {
  return (process.env.API_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .map(huella);
}

const huella = (k: string) => createHash("sha256").update(k).digest();

export function autorizado(req: Request) {
  const [tipo, clave] = (req.headers.get("authorization") ?? "").split(" ");
  if (tipo !== "Bearer" || !clave) return false;
  const h = huella(clave);
  // Compara contra todas sin cortar antes, para no filtrar cuál coincidió por tiempo de respuesta.
  return clavesValidas().reduce((ok, valida) => timingSafeEqual(h, valida) || ok, false);
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export const errorJson = (status: number, codigo: string, mensaje: string) =>
  json({ error: { codigo, mensaje } }, status);

export const noAutorizado = () =>
  errorJson(401, "no_autorizado", "Falta la API key o no es válida. Envíala como 'Authorization: Bearer <clave>'.");

/** Forma pública de un asistente. La nota de pago es interna y no se expone. */
export function serializar(a: Asistente) {
  return {
    id: a.id,
    nombre: a.nombre,
    email: a.email,
    telefono: a.telefono,
    registrado_en: new Date(a.creado_en).toISOString(),
    entrada_url: linkDe(a.id),
    imagen_url: `${SITE_URL}/entrada/${a.id}/imagen`,
  };
}
