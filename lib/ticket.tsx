import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const TICKET_W = 1024;
export const TICKET_H = 1536;

// Caja blanca del nombre en el diseño original (px sobre 1024x1536).
const NOMBRE_BOX = { left: 96, top: 1010, width: 833, height: 74 };

let assets: Promise<{ base: string; font: Buffer }> | undefined;

export function cargarAssets() {
  assets ??= (async () => {
    const dir = join(process.cwd(), "assets");
    const [png, font] = await Promise.all([
      readFile(join(dir, "ticket-base.png")),
      readFile(join(dir, "GoogleSans-Bold.ttf")),
    ]);
    return { base: `data:image/png;base64,${png.toString("base64")}`, font };
  })();
  return assets;
}

function tamanoFuente(nombre: string) {
  // Google Sans Bold ≈ 0.53em por carácter; el diseño usa ~40px y deja ~780px útiles.
  return Math.max(22, Math.min(40, Math.floor(780 / (nombre.length * 0.53))));
}

/** Entrada completa; `scale` permite incrustarla más pequeña (p. ej. en la imagen OG). */
export function Ticket({ nombre, base, scale = 1 }: { nombre: string; base: string; scale?: number }) {
  const s = (n: number) => n * scale;
  return (
    <div style={{ display: "flex", position: "relative", width: s(TICKET_W), height: s(TICKET_H) }}>
      <img src={base} width={s(TICKET_W)} height={s(TICKET_H)} style={{ position: "absolute", inset: 0 }} />
      <div
        style={{
          position: "absolute",
          left: s(NOMBRE_BOX.left),
          top: s(NOMBRE_BOX.top),
          width: s(NOMBRE_BOX.width),
          height: s(NOMBRE_BOX.height),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Google Sans",
          fontWeight: 700,
          fontSize: s(tamanoFuente(nombre)),
          color: "#111",
          letterSpacing: s(-0.3),
        }}
      >
        {nombre}
      </div>
    </div>
  );
}
