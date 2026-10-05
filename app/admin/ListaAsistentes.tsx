"use client";

import { useMemo, useState, useTransition } from "react";
import type { Asistente } from "@/lib/asistentes";
import { eliminar } from "./actions";
import { BotonCopiar } from "./BotonCopiar";

type Fila = Asistente & { link: string };

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function linkWhatsApp(a: Fila) {
  let tel = (a.telefono ?? "").replace(/\D/g, "");
  if (!tel) return null;
  if (tel.length === 9) tel = `51${tel}`; // celular peruano sin código de país
  const msg = `¡Hola ${a.nombre.split(" ")[0]}! 🎉 Aquí está tu entrada Premium para el DevFest 2026 Tacna: ${a.link}`;
  return `https://wa.me/${tel}?text=${encodeURIComponent(msg)}`;
}

const fecha = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Lima" });

export function ListaAsistentes({ asistentes }: { asistentes: Fila[] }) {
  const [filtro, setFiltro] = useState("");
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const visibles = useMemo(() => {
    const q = normalizar(filtro.trim());
    if (!q) return asistentes;
    return asistentes.filter((a) => normalizar([a.nombre, a.email, a.telefono, a.nota].join(" ")).includes(q));
  }, [asistentes, filtro]);

  return (
    <section className="panel">
      <div className="lista-cabecera">
        <h2>Asistentes <span className="contador">{asistentes.length}</span></h2>
        <input type="search" placeholder="Buscar por nombre, correo, nota…" value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Buscar asistentes" />
      </div>

      {visibles.length === 0 ? (
        <p className="vacio">{asistentes.length ? "Ningún asistente coincide con la búsqueda." : "Aún no hay asistentes. Registra el primero arriba."}</p>
      ) : (
        <ul className="lista">
          {visibles.map((a) => {
            const wa = linkWhatsApp(a);
            return (
              <li key={a.id} className="fila">
                <img src={`/entrada/${a.id}/imagen`} alt="" width={48} height={72} loading="lazy" />
                <div className="fila-info">
                  <strong>{a.nombre}</strong>
                  <span>{[a.email, a.telefono].filter(Boolean).join(" · ") || "Sin contacto"}</span>
                  {a.nota && <span className="nota">{a.nota}</span>}
                  <span className="fecha">{fecha.format(new Date(a.creado_en))}</span>
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
