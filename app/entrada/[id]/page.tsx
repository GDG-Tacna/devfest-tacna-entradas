import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buscarAsistente, linkDe } from "@/lib/asistentes";
import { etiquetaTipo, REGISTRO_URL } from "@/lib/evento";
import { Compartir } from "./Compartir";

// Se generan bajo demanda y quedan en caché; el admin las revalida al crear/editar/eliminar.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/entrada/[id]">): Promise<Metadata> {
  const { id } = await params;
  const asistente = await buscarAsistente(id);
  if (!asistente) return {};
  const tipo = asistente.tipo ?? "premium";
  const etiqueta = etiquetaTipo(tipo);
  const title = `${asistente.nombre} · DevFest 2026 Tacna`;
  const description = `¡Ya tengo mi entrada ${etiqueta} para el DevFest 2026 Tacna! Sáb 21 de noviembre en la UTP. Regístrate en devfest.gdgtacna.com`;
  return {
    title,
    description,
    openGraph: { title, description, url: `/entrada/${id}`, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: false },
  };
}

export default async function EntradaPage({ params }: PageProps<"/entrada/[id]">) {
  const { id } = await params;
  const asistente = await buscarAsistente(id);
  if (!asistente) notFound();

  const tipo = asistente.tipo ?? "premium";
  const esPro = tipo === "pro";
  const imagen = `/entrada/${id}/imagen`;

  return (
    <main className={`entrada${esPro ? " entrada-pro" : ""}`}>
      <header className="saludo">
        <p className="eyebrow">DevFest 2026 · Tacna</p>
        <h1>¡Hola, {asistente.nombre.split(" ")[0]}!</h1>
        <p>
          {esPro
            ? "Esta es tu entrada Pro (incluye certificado). Compártela en tus redes e invita a más personas a sumarse al DevFest Tacna."
            : "Esta es tu entrada Premium. Compártela en tus redes e invita a más personas a sumarse al DevFest Tacna."}
        </p>
      </header>

      <img className="ticket" src={imagen} alt={`Entrada ${etiquetaTipo(tipo)} DevFest 2026 Tacna de ${asistente.nombre}`} width={1024} height={1536} />

      <Compartir url={linkDe(id)} imagen={imagen} nombre={asistente.nombre} tipo={tipo} />

      <section className="registro">
        <h2>¿Aún no tienes tu entrada?</h2>
        <p>Sé parte del DevFest 2026 Tacna: charlas, talleres y comunidad tech el 21 de noviembre.</p>
        <a className="btn btn-registro" href={REGISTRO_URL}>Regístrate al DevFest Tacna</a>
      </section>
    </main>
  );
}
