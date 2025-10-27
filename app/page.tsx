import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirigir directamente a la página de consulta pública
  redirect("/consulta")
}
