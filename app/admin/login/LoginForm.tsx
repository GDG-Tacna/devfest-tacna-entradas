"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [estado, accion, pendiente] = useActionState(login, null);
  return (
    <form action={accion} className="panel">
      <label>
        Contraseña
        <input type="password" name="password" required autoFocus autoComplete="current-password" />
      </label>
      {estado?.error && <p className="error" role="alert">{estado.error}</p>}
      <button className="primario" disabled={pendiente}>{pendiente ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}
