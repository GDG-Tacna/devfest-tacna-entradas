"use client";

import { useState } from "react";

export function BotonCopiar({ texto, etiqueta = "Copiar link" }: { texto: string; etiqueta?: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      className="secundario"
      onClick={async () => {
        await navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1500);
      }}
    >
      {copiado ? "¡Copiado!" : etiqueta}
    </button>
  );
}
