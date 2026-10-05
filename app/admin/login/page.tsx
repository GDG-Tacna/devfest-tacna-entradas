import { redirect } from "next/navigation";
import { esAdmin } from "@/lib/admin-auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await esAdmin()) redirect("/admin");
  return (
    <main className="login">
      <p className="eyebrow">DevFest 2026 · Tacna</p>
      <h1>Admin de entradas</h1>
      <LoginForm />
    </main>
  );
}
