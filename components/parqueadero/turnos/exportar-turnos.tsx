"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Download } from "lucide-react"
import { getNowDateColombia } from "@/lib/utils/date"

export function ExportarTurnos() {
  const hoy = getNowDateColombia()
  const [desde, setDesde] = useState(hoy)
  const [hasta, setHasta] = useState(hoy)
  const [open, setOpen]   = useState(false)

  const exportar = () => {
    window.open(`/api/parqueadero/turnos/exportar?desde=${desde}&hasta=${hasta}`, "_blank")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Excel
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3" align="end">
        <p className="text-sm font-medium">Exportar por rango de fechas</p>
        <div className="space-y-1.5">
          <Label className="text-xs">Desde</Label>
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hasta</Label>
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <Button size="sm" className="w-full" onClick={exportar}>
          <Download className="h-4 w-4 mr-1" />
          Descargar Excel
        </Button>
      </PopoverContent>
    </Popover>
  )
}
