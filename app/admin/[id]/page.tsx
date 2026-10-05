import { notFound } from "next/navigation";
import { buscarAsistente } from "@/lib/asistentes";
import { requerirAdmin } from "@/lib/admin-auth";
import { editar } from "../actions";
import { FormAsistente } from "../FormAsistente";

export default async function EditarPage({ params }: PageProps<"/admin/[id]">) {
  await requerirAdmin();
  const { id } = await params;
  const asistente = await buscarAsistente(id);
  if (!asistente) notFound();

  return (
    <main className="dashboard">
      <header className="barra">
        <div>
          <p className="eyebrow">Editar asistente</p>
          <h1>{asistente.nombre}</h1>
        </div>
      </header>
      <section className="panel">
        <p className="ayuda">El link de la entrada no cambia aunque corrijas el nombre.</p>
        <FormAsistente accion={editar.bind(null, id)} inicial={asistente} />
      </section>
    </main>
  );
}
