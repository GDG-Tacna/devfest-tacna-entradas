import { REGISTRO_URL } from "@/lib/evento";

export default function Home() {
  return (
    <main className="home">
      <p className="eyebrow">GDG Tacna presenta</p>
      <h1>DevFest 2026 Tacna</h1>
      <div className="franja" aria-hidden="true" />
      <p>Sáb 21 de marzo 2026 · Universidad Tecnológica del Perú (UTP)</p>
      <a className="btn btn-registro" href={REGISTRO_URL}>Regístrate al DevFest Tacna</a>
      <p className="nota">¿Ya tienes tu entrada Premium? Abre el enlace personal que te enviamos para ver y compartir tu entrada.</p>
    </main>
  );
}
