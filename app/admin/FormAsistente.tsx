"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Asistente } from "@/lib/asistentes";
import type { Estado } from "./actions";
import { BotonCopiar } from "./BotonCopiar";

type Props = {
  accion: (prev: Estado, form: FormData) => Promise<Estado>;
  inicial?: Pick<Asistente, "nombre" | "email" | "telefono" | "nota">;
};

export function FormAsistente({ accion, inicial }: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, null);
  const form = useRef<HTMLFormElement>(null);
  const editando = !!inicial;

  // Tras crear, limpia el formulario para registrar al siguiente.
  useEffect(() => {
    if (estado?.creado) form.current?.reset();
  }, [estado]);

  return (
    <>
      <form ref={form} action={enviar} className="form-asistente">
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
          <button className="primario" disabled={pendiente}>
            {pendiente ? "Guardando…" : editando ? "Guardar cambios" : "Generar entrada"}
          </button>
          {editando && <a href="/admin" className="secundario">Cancelar</a>}
        </div>
      </form>

      {estado?.error && <p className="error" role="alert">{estado.error}</p>}
      {estado?.creado && (
        <div className="creado" role="status">
          <img src={`/entrada/${estado.creado.id}/imagen`} alt="" width={64} height={96} />
          <div>
            <strong>Entrada generada para {estado.creado.nombre}</strong>
            <a href={estado.creado.link} target="_blank" rel="noreferrer">{estado.creado.link}</a>
          </div>
          <BotonCopiar texto={estado.creado.link} />
        </div>
      )}
    </>
  );
}
