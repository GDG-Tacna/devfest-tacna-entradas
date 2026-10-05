import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { buscarAsistente } from "@/lib/asistentes";
import { cargarAssets, Ticket, TICKET_H, TICKET_W } from "@/lib/ticket";

export function generateStaticParams() {
  return [];
}

export async function GET(_req: Request, { params }: RouteContext<"/entrada/[id]/imagen">) {
  const { id } = await params;
  const asistente = await buscarAsistente(id);
  if (!asistente) notFound();

  const { base, font } = await cargarAssets();
  return new ImageResponse(<Ticket nombre={asistente.nombre} base={base} />, {
    width: TICKET_W,
    height: TICKET_H,
    fonts: [{ name: "Google Sans", data: font, weight: 700, style: "normal" }],
  });
}
