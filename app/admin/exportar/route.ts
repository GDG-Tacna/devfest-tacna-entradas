import { esAdmin } from "@/lib/admin-auth";
import { linkDe, listarAsistentes } from "@/lib/asistentes";

const celda = (v: string | null) => `"${(v ?? "").replace(/"/g, '""')}"`;

export async function GET() {
  if (!(await esAdmin())) return new Response("No autorizado", { status: 401 });

  const filas = (await listarAsistentes()).map((a) =>
    [a.nombre, a.email, a.telefono, a.nota, a.creado_en ? new Date(a.creado_en).toISOString() : "", linkDe(a.id)]
      .map((v) => celda(v))
      .join(","),
  );
  // BOM para que Excel abra bien las tildes.
  const csv = "﻿" + ["nombre,email,telefono,nota,registrado,link", ...filas].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="asistentes-devfest-tacna.csv"',
      "Cache-Control": "no-store",
    },
  });
}
