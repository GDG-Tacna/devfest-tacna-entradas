import { listarAsistentes, linkDe } from "@/lib/asistentes";
import { requerirAdmin } from "@/lib/admin-auth";
import { crear, logout } from "./actions";
import { FormAsistente } from "./FormAsistente";
import { ListaAsistentes } from "./ListaAsistentes";

export default async function AdminPage() {
  await requerirAdmin();
  const asistentes = await listarAsistentes();

  return (
    <main className="dashboard">
      <header className="barra">
        <div>
          <p className="eyebrow">DevFest 2026 · Tacna</p>
          <h1>Entradas Premium</h1>
        </div>
        <div className="barra-acciones">
          <a href="/admin/exportar" className="secundario">Exportar CSV</a>
          <form action={logout}>
            <button className="secundario">Salir</button>
          </form>
        </div>
      </header>

      <section className="panel">
        <h2>Nuevo asistente</h2>
        <p className="ayuda">Regístralo cuando confirmes su pago. Se genera su entrada y su link al instante.</p>
        <FormAsistente accion={crear} />
      </section>

      <ListaAsistentes asistentes={asistentes.map((a) => ({ ...a, link: linkDe(a.id) }))} />
    </main>
  );
}
