import { paginarAsistentes } from "@/lib/asistentes";
import { autorizado, errorJson, json, noAutorizado, serializar } from "@/lib/api";

const LIMITE_DEFECTO = 50;
const LIMITE_MAX = 200;

export async function GET(req: Request) {
  if (!autorizado(req)) return noAutorizado();

  const params = new URL(req.url).searchParams;

  const limite = Number(params.get("limite") ?? LIMITE_DEFECTO);
  if (!Number.isInteger(limite) || limite < 1 || limite > LIMITE_MAX)
    return errorJson(400, "parametro_invalido", `'limite' debe ser un entero entre 1 y ${LIMITE_MAX}.`);

  const offset = Number(params.get("offset") ?? 0);
  if (!Number.isInteger(offset) || offset < 0)
    return errorJson(400, "parametro_invalido", "'offset' debe ser un entero mayor o igual a 0.");

  const desde = params.get("desde");
  if (desde !== null && Number.isNaN(Date.parse(desde)))
    return errorJson(400, "parametro_invalido", "'desde' debe ser una fecha ISO 8601, p. ej. 2026-10-01T00:00:00Z.");

  const { filas, total } = await paginarAsistentes({ limite, offset, desde });
  const siguiente = offset + filas.length < total ? offset + filas.length : null;

  return json({
    datos: filas.map(serializar),
    paginacion: { total, limite, offset, siguiente_offset: siguiente },
  });
}
