"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  actualizarAsistente,
  crearAsistente,
  eliminarAsistente,
  linkDe,
  type DatosAsistente,
} from "@/lib/asistentes";
import { cerrarSesion, iniciarSesion, passwordCorrecta, requerirAdmin } from "@/lib/admin-auth";

export type Estado = { error?: string; creado?: { id: string; nombre: string; link: string } } | null;

function leerDatos(form: FormData): DatosAsistente | string {
  const texto = (k: string, max: number) => {
    const v = String(form.get(k) ?? "").trim().replace(/\s+/g, " ");
    return v ? v.slice(0, max) : null;
  };
  const nombre = texto("nombre", 200);
  if (!nombre || nombre.length < 3) return "Escribe el nombre completo del asistente.";
  if (nombre.length > 60) return "El nombre es muy largo para la entrada (máx. 60 caracteres).";

  const email = texto("email", 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "El correo no parece válido.";

  const telefono = texto("telefono", 30);
  if (telefono && !/^\+?[\d\s-]{6,}$/.test(telefono)) return "El teléfono solo puede tener números, espacios o +.";

  return { nombre, email, telefono, nota: texto("nota", 200) };
}

function revalidarEntrada(id: string) {
  for (const p of ["", "/imagen", "/opengraph-image"]) revalidatePath(`/entrada/${id}${p}`);
}

export async function crear(_prev: Estado, form: FormData): Promise<Estado> {
  await requerirAdmin();
  const datos = leerDatos(form);
  if (typeof datos === "string") return { error: datos };

  const id = await crearAsistente(datos);
  revalidarEntrada(id);
  revalidatePath("/admin");
  return { creado: { id, nombre: datos.nombre, link: linkDe(id) } };
}

export async function editar(id: string, _prev: Estado, form: FormData): Promise<Estado> {
  await requerirAdmin();
  const datos = leerDatos(form);
  if (typeof datos === "string") return { error: datos };

  await actualizarAsistente(id, datos);
  revalidarEntrada(id);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function eliminar(id: string) {
  await requerirAdmin();
  await eliminarAsistente(id);
  revalidarEntrada(id);
  revalidatePath("/admin");
}

export async function login(_prev: Estado, form: FormData): Promise<Estado> {
  if (!passwordCorrecta(String(form.get("password") ?? ""))) {
    // Frena intentos de fuerza bruta sin necesidad de infraestructura extra.
    await new Promise((r) => setTimeout(r, 1000));
    return { error: "Contraseña incorrecta." };
  }
  await iniciarSesion();
  redirect("/admin");
}

export async function logout() {
  await cerrarSesion();
  redirect("/admin/login");
}
