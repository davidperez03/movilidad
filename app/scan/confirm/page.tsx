"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, LogIn, LogOut } from "lucide-react"
import { Suspense } from "react"

function horaCol(ts: string) {
  return new Date(ts).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    weekday:  "long",
    day:      "numeric",
    month:    "long",
    hour:     "2-digit",
    minute:   "2-digit",
    second:   "2-digit",
    hour12:   true,
  })
}

function ConfirmContent() {
  const params = useSearchParams()
  const router = useRouter()

  const tipo   = params.get("tipo") as "INGRESO" | "SALIDA" | null
  const ts     = params.get("ts") ?? ""
  const nombre = params.get("nombre") ?? ""

  if (!tipo) {
    router.replace("/scan")
    return null
  }

  const esIngreso = tipo === "INGRESO"

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6 text-center w-full max-w-sm mx-auto">
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center ${
          esIngreso ? "bg-emerald-100" : "bg-rose-100"
        }`}
      >
        {esIngreso
          ? <LogIn  className="h-12 w-12 text-emerald-600" />
          : <LogOut className="h-12 w-12 text-rose-600" />
        }
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 text-emerald-600">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">Registrado exitosamente</span>
        </div>
        <h1 className="text-3xl font-bold">
          {esIngreso ? "INGRESO" : "SALIDA"}
        </h1>
        <p className="text-lg font-medium">{decodeURIComponent(nombre)}</p>
        {ts && (
          <p className="text-sm text-muted-foreground capitalize">
            {horaCol(decodeURIComponent(ts))}
          </p>
        )}
      </div>

      <button
        onClick={() => router.replace("/scan")}
        className="w-full max-w-xs h-14 rounded-xl bg-foreground text-background text-base font-semibold active:scale-95 transition-all"
      >
        Listo
      </button>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmContent />
    </Suspense>
  )
}
