import { ImageResponse } from "next/og";
import { buscarAsistente } from "@/lib/asistentes";
import { cargarAssets, Ticket } from "@/lib/ticket";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Entrada DevFest 2026 Tacna";

export function generateStaticParams() {
  return [];
}

const COLORES = ["#4285F4", "#EA4335", "#FBBC04", "#34A853"];

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nombre = (await buscarAsistente(id))?.nombre ?? "Asistente";
  const { base, font } = await cargarAssets();

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#FEF5D3", fontFamily: "Google Sans" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, padding: "0 60px 0 72px" }}>
          <div style={{ display: "flex", fontSize: 30, color: "#5f5a48" }}>¡Tengo mi entrada para el</div>
          <div style={{ display: "flex", fontSize: 76, color: "#111", lineHeight: 1.05, marginTop: 8 }}>DevFest 2026 Tacna!</div>
          <div style={{ display: "flex", marginTop: 28, height: 10, width: 360 }}>
            {COLORES.map((c) => (
              <div key={c} style={{ flex: 1, background: c }} />
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#111", marginTop: 32 }}>{nombre}</div>
          <div style={{ display: "flex", fontSize: 24, color: "#5f5a48", marginTop: 10 }}>
            Sáb 21 de noviembre · UTP Tacna
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", paddingRight: 56 }}>
          <Ticket nombre={nombre} base={base} scale={0.385} />
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Google Sans", data: font, weight: 700, style: "normal" }] },
  );
}
