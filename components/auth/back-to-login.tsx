import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function BackToLogin() {
  return (
    <div className="mt-4 text-center text-sm">
      <Link href="/auth/login" className="text-primary hover:underline inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" />
        Volver al inicio de sesión
      </Link>
    </div>
  )
}
