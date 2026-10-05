import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "gdg_admin";

// La sesión es un HMAC de la contraseña: cambiar ADMIN_PASSWORD cierra todas las sesiones.
function token() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("Falta la variable de entorno ADMIN_PASSWORD");
  return createHmac("sha256", password).update("devfest-tacna-admin").digest("hex");
}

function iguales(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function passwordCorrecta(intento: string) {
  const real = process.env.ADMIN_PASSWORD ?? "";
  const h = (s: string) => createHmac("sha256", "cmp").update(s).digest("hex");
  return real.length > 0 && iguales(h(intento), h(real));
}

export async function esAdmin() {
  const valor = (await cookies()).get(COOKIE)?.value;
  return !!valor && iguales(valor, token());
}

/** Llamar al inicio de cada página y server action del admin. */
export async function requerirAdmin() {
  if (!(await esAdmin())) redirect("/admin/login");
}

export async function iniciarSesion() {
  (await cookies()).set(COOKIE, token(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE);
}
