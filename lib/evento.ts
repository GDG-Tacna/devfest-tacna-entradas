export const REGISTRO_URL = "https://devfest.gdgtacna.com";

export const TIPOS_ENTRADA = ["premium", "pro"] as const;
export type TipoEntrada = (typeof TIPOS_ENTRADA)[number];

export function esTipoEntrada(v: unknown): v is TipoEntrada {
  return v === "premium" || v === "pro";
}

export function etiquetaTipo(tipo: TipoEntrada) {
  return tipo === "pro" ? "Pro" : "Premium";
}
