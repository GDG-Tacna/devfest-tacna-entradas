"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { Asistente } from "@/lib/asistentes";
import { etiquetaTipo, type TipoEntrada } from "@/lib/evento";
import type { Estado } from "./actions";
import { BotonCopiar } from "./BotonCopiar";

type Props = {
  accion: (prev: Estado, form: FormData) => Promise<Estado>;
  inicial?: Pick<Asistente, "nombre" | "tipo" | "email" | "telefono" | "nota">;
};

export function FormAsistente({ accion, inicial }: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, null);
  const [tipo, setTipo] = useState<TipoEntrada>(inicial?.tipo ?? "premium");
  const form = useRef<HTMLFormElement>(null);
  const editando = !!inicial;

  // Tras crear, limpia los campos de texto pero conserva el tipo elegido por si registra varios seguidos.
  useEffect(() => {
    if (!estado?.creado || !form.current) return;
    for (const nombreCampo of ["nombre", "email", "telefono", "nota"]) {
      const el = form.current.elements.namedItem(nombreCampo);
      if (el instanceof HTMLInputElement) el.value = "";
    }
  }, [estado]);

  return (
    <>
      <form ref={form} action={enviar} className="form-asistente">
        <fieldset className="ancho selector-tipo">
          <legend>Tipo de entrada <span className="req">*</span></legend>
          <div className="opciones-tipo">
            <label className={`opcion-tipo opcion-premium${tipo === "premium" ? " activa" : ""}`}>
              <input
                type="radio"
                name="tipo"
                value="premium"
                checked={tipo === "premium"}
                onChange={() => setTipo("premium")}
              />
              <span className="opcion-titulo">
                <span className="punto punto-premium" aria-hidden="true" />
                Experiencia Premium
              </span>
              <span className="opcion-desc">Fondo crema clásico</span>
            </label>

            <label className={`opcion-tipo opcion-pro${tipo === "pro" ? " activa" : ""}`}>
              <input
                type="radio"
                name="tipo"
                value="pro"
                checked={tipo === "pro"}
                onChange={() => setTipo("pro")}
              />
              <span className="opcion-titulo">
                <span className="punto punto-pro" aria-hidden="true" />
                Experiencia Pro
              </span>
              <span className="opcion-desc">Fondo azul · Incluye certificado</span>
            </label>
          </div>
        </fieldset>

        <label className="ancho">
          <span>Nombre completo <span className="req">*</span></span>
          <input name="nombre" required maxLength={60} defaultValue={inicial?.nombre} placeholder="Tal como aparecerá en la entrada" />
        </label>
        <label>
          Correo
          <input name="email" type="email" defaultValue={inicial?.email ?? ""} placeholder="opcional" />
        </label>
        <label>
          Celular
          <input name="telefono" type="tel" defaultValue={inicial?.telefono ?? ""} placeholder="opcional, para enviarle por WhatsApp" />
        </label>
        <label className="ancho">
          Nota de pago
          <input name="nota" maxLength={200} defaultValue={inicial?.nota ?? ""} placeholder="opcional, p. ej. Yape op. 123456" />
        </label>
        <div className="ancho fila-boton">
          <button className={`primario${tipo === "pro" ? " primario-pro" : ""}`} disabled={pendiente}>
            {pendiente
              ? "Guardando…"
              : editando
                ? "Guardar cambios"
                : `Generar entrada ${etiquetaTipo(tipo)}`}
          </button>
          {editando && <a href="/admin" className="secundario">Cancelar</a>}
        </div>
      </form>

      {estado?.error && <p className="error" role="alert">{estado.error}</p>}
      {estado?.creado && (
        <div className="creado" role="status">
          <img src={`/entrada/${estado.creado.id}/imagen?tipo=${estado.creado.tipo}`} alt="" width={64} height={96} />
          <div>
            <strong>
              Entrada {etiquetaTipo(estado.creado.tipo)} generada para {estado.creado.nombre}
            </strong>
            <a href={estado.creado.link} target="_blank" rel="noreferrer">{estado.creado.link}</a>
          </div>
          <BotonCopiar texto={estado.creado.link} />
        </div>
      )}
    </>
  );
}
