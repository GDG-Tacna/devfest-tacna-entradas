import { buscarAsistente } from "@/lib/asistentes";
import { autorizado, errorJson, json, noAutorizado, serializar } from "@/lib/api";

export async function GET(req: Request, { params }: RouteContext<"/api/v1/asistentes/[id]">) {
  if (!autorizado(req)) return noAutorizado();

  const { id } = await params;
  const asistente = await buscarAsistente(id);
  if (!asistente) return errorJson(404, "no_encontrado", `No existe un asistente con id '${id}'.`);

  return json({ datos: serializar(asistente) });
}
