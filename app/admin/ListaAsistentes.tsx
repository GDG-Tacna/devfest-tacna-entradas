"use client";

import { useMemo, useState, useTransition } from "react";
import type { Asistente } from "@/lib/asistentes";
import type { TipoEntrada } from "@/lib/evento";
import { eliminar } from "./actions";
import { BotonCopiar } from "./BotonCopiar";

type Fila = Asistente & { link: string };
type FiltroTipo = "todos" | TipoEntrada;

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function linkWhatsApp(a: Fila) {
  let tel = (a.telefono ?? "").replace(/\D/g, "");
  if (!tel) return null;
  if (tel.length === 9) tel = `51${tel}`; // celular peruano sin código de país
  const detalle = a.tipo === "pro" ? "Pro (con certificado)" : "Premium";
  const msg = `¡Hola ${a.nombre.split(" ")[0]}! 🎉 Aquí está tu entrada ${detalle} para el DevFest 2026 Tacna: ${a.link}`;
  return `https://wa.me/${tel}?text=${encodeURIComponent(msg)}`;
}

const formatoFecha = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Lima",
});
const formatearFecha = (iso: string) => formatoFecha.format(new Date(iso)).replace(/\s+/g, " ");

export function ListaAsistentes({ asistentes }: { asistentes: Fila[] }) {
  const [filtro, setFiltro] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const conteos = useMemo(() => {
    let pro = 0;
    for (const a of asistentes) if (a.tipo === "pro") pro++;
    return { todos: asistentes.length, premium: asistentes.length - pro, pro };
  }, [asistentes]);

  const visibles = useMemo(() => {
    const q = normalizar(filtro.trim());
    return asistentes.filter((a) => {
      const t = a.tipo ?? "premium";
      if (filtroTipo !== "todos" && t !== filtroTipo) return false;
      if (!q) return true;
      return normalizar([a.nombre, a.email, a.telefono, a.nota, t].join(" ")).includes(q);
    });
  }, [asistentes, filtro, filtroTipo]);

  return (
    <section className="panel">
      <div className="lista-cabecera">
        <div className="lista-titulo-filtros">
          <h2>Asistentes <span className="contador">{asistentes.length}</span></h2>
          <div className="filtros-tipo" role="group" aria-label="Filtrar por tipo de entrada">
            <button
              type="button"
              className={`chip-filtro${filtroTipo === "todos" ? " activo" : ""}`}
              onClick={() => setFiltroTipo("todos")}
            >
              Todas ({conteos.todos})
            </button>
            <button
              type="button"
              className={`chip-filtro${filtroTipo === "premium" ? " activo" : ""}`}
              onClick={() => setFiltroTipo("premium")}
            >
              Premium ({conteos.premium})
            </button>
            <button
              type="button"
              className={`chip-filtro chip-pro${filtroTipo === "pro" ? " activo" : ""}`}
              onClick={() => setFiltroTipo("pro")}
            >
              Pro ({conteos.pro})
            </button>
          </div>
        </div>
        <input type="search" placeholder="Buscar por nombre, correo, nota…" value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Buscar asistentes" />
      </div>

      {visibles.length === 0 ? (
        <p className="vacio">{asistentes.length ? "Ningún asistente coincide con la búsqueda." : "Aún no hay asistentes. Registra el primero arriba."}</p>
      ) : (
        <ul className="lista">
          {visibles.map((a) => {
            const wa = linkWhatsApp(a);
            const esPro = a.tipo === "pro";
            return (
              <li key={a.id} className={`fila${esPro ? " fila-pro" : ""}`}>
                <img src={`/entrada/${a.id}/imagen?tipo=${a.tipo ?? "premium"}`} alt="" width={48} height={72} loading="lazy" />
                <div className="fila-info">
                  <div className="fila-nombre">
                    <strong>{a.nombre}</strong>
                    <span className={`insignia ${esPro ? "insignia-pro" : "insignia-premium"}`}>
                      {esPro ? "Pro · Certificado" : "Premium"}
                    </span>
                  </div>
                  <span>{[a.email, a.telefono].filter(Boolean).join(" · ") || "Sin contacto"}</span>
                  {a.nota && <span className="nota">{a.nota}</span>}
                  <span className="fecha" suppressHydrationWarning>{formatearFecha(a.creado_en)}</span>
                </div>
                <div className="fila-acciones">
                  <a className="secundario" href={a.link} target="_blank" rel="noreferrer">Ver</a>
                  <BotonCopiar texto={a.link} etiqueta="Copiar" />
                  {wa && <a className="secundario wa" href={wa} target="_blank" rel="noreferrer">WhatsApp</a>}
                  <a className="secundario" href={`/admin/${a.id}`}>Editar</a>
                  {confirmando === a.id ? (
                    <>
                      <button className="peligro" disabled={pendiente} onClick={() => startTransition(() => eliminar(a.id))}>
                        {pendiente ? "Eliminando…" : "Sí, eliminar"}
                      </button>
                      <button className="secundario" onClick={() => setConfirmando(null)}>No</button>
                    </>
                  ) : (
                    <button className="secundario texto-peligro" onClick={() => setConfirmando(a.id)}>Eliminar</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
