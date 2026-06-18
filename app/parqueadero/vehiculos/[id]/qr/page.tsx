"use client"

import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://movilidad.vercel.app"

export default function GruaQRPage() {
  const { id } = useParams<{ id: string }>()
  const url    = `${SITE}/grua/${id}`

  return (
    <>
      <div className="print:hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/parqueadero/vehiculos/${id}`}><ArrowLeft className="h-4 w-4 mr-1" />Volver</Link>
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />Imprimir
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 pb-10 print:fixed print:inset-0">
        <div className="rounded-2xl border-2 border-border print:border-black p-10 flex flex-col items-center gap-6 w-full max-w-xs">
          <div className="text-center space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Registro de Salida</p>
            <h2 className="text-2xl font-bold">Grúa</h2>
          </div>
          <QRCodeSVG value={url} size={220} level="H" includeMargin className="rounded-xl" />
          <div className="text-center space-y-2">
            <p className="text-base font-semibold">Escanee para registrar salida o regreso</p>
            <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1 rounded-full break-all">{url}</p>
          </div>
        </div>
      </div>
    </>
  )
}
