"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"

const modulos = [
  { href: "/movilidad", label: "Movilidad", descripcion: "Gestión de movilidad vehicular" },
  { href: "/parqueadero", label: "Parqueadero", descripcion: "Inspecciones de grúas" },
]

export function ModulosDropdown() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive =
    pathname.startsWith("/movilidad") || pathname.startsWith("/parqueadero")

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
          isActive
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:border-primary hover:text-foreground"
        }`}
      >
        <span>Módulos</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-64 rounded-md border bg-popover shadow-lg z-20">
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                MÓDULOS DEL SISTEMA
              </div>
              {modulos.map((modulo) => (
                <Link
                  key={modulo.href}
                  href={modulo.href}
                  onClick={() => setOpen(false)}
                  className="flex flex-col gap-0.5 rounded-sm px-2 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <span className="text-sm font-medium">{modulo.label}</span>
                  <span className="text-xs text-muted-foreground">{modulo.descripcion}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
