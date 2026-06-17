"use client"

import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

const URL_SCAN = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://movilidad.vercel.app"}/scan`

export default function QRPage() {
  return (
    <>
      {/* Oculto al imprimir */}
      <div className="print:hidden space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">QR de Asistencia</h1>
            <p className="text-muted-foreground text-sm">Imprima y pegue en la entrada del parqueadero</p>
          </div>
          <Button onClick={() => window.print()} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Tarjeta — visible siempre, centrada al imprimir */}
      <div className="flex items-center justify-center print:fixed print:inset-0">
        <div className="rounded-2xl border-2 border-border print:border-black p-10 flex flex-col items-center gap-6 w-full max-w-sm">
          <div className="text-center space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground print:text-gray-500">
              Control de Asistencia
            </p>
            <h2 className="text-2xl font-bold">Parqueadero</h2>
          </div>

          <QRCodeSVG
            value={URL_SCAN}
            size={220}
            level="H"
            includeMargin
            className="rounded-xl"
          />

          <div className="text-center space-y-2">
            <p className="text-base font-semibold">Escanee para registrar</p>
            <p className="text-sm text-muted-foreground print:text-gray-500">su ingreso o salida</p>
            <p className="text-xs text-muted-foreground print:text-gray-400 font-mono bg-muted print:bg-gray-100 px-3 py-1 rounded-full break-all">
              {URL_SCAN}
            </p>
          </div>

          <div className="w-full border-t pt-4 text-center">
            <p className="text-xs text-muted-foreground print:text-gray-500">
              Use su número de documento y los últimos 4 dígitos como PIN
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
