"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Download, Loader2 } from "lucide-react"
import { pdf } from "@react-pdf/renderer"
import { DocumentoRemisionPDF } from "./documento-remision-pdf"

interface BotonDescargarRemisionProps {
  trasladoId: string
  placa: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
}

export function BotonDescargarRemision({
  trasladoId,
  placa,
  size = "sm",
  variant = "outline",
  className = "",
  showIcon = true,
  children,
}: BotonDescargarRemisionProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const descargarPDF = async () => {
    setLoading(true)
    try {
      // 1. Obtener información del traslado con organismo destino y vehículo
      const { data: traslado, error: errorTraslado } = await supabase
        .from("mov_traslados")
        .select(`
          id,
          fecha_tramite,
          observaciones,
          creado_en,
          organismo_destino:mov_organismos_transito!organismo_destino_id (
            id,
            nombre,
            tipo,
            telefono,
            direccion,
            municipio,
            departamento
          ),
          cuenta:mov_cuentas_vehiculos!cuenta_id (
            placa,
            numero_cuenta,
            tipo_servicio
          )
        `)
        .eq("id", trasladoId)
        .single()

      if (errorTraslado || !traslado) {
        toast.error("Error al cargar información del traslado")
        setLoading(false)
        return
      }

      // 2. Información de OT Yopal (organismo origen - siempre es Yopal)
      const otYopal = {
        id: "ot-yopal",
        nombre: "Organismo de Tránsito de Yopal",
        tipo: "Organismo de Tránsito",
        telefono: "098 635 8080",
        direccion: "Calle 20 No. 19-45",
        municipio: "Yopal",
        departamento: "Casanare",
      }

      // 3. Generar el PDF
      const documento = (
        <DocumentoRemisionPDF
          traslado={{
            id: traslado.id,
            fecha_tramite: traslado.fecha_tramite,
            observaciones: traslado.observaciones,
            creado_en: traslado.creado_en,
          }}
          organismoOrigen={otYopal}
          organismoDestino={traslado.organismo_destino as any}
          vehiculo={traslado.cuenta as any}
        />
      )

      // 4. Convertir a blob y descargar
      const blob = await pdf(documento).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Remision_${placa}_${new Date().getTime()}.pdf`
      link.click()
      URL.revokeObjectURL(url)

      toast.success("PDF descargado exitosamente")
    } catch (error) {
      toast.error("Error al generar el documento PDF")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={descargarPDF}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className={`${showIcon ? "h-4 w-4 mr-2" : "h-4 w-4"} animate-spin`} />
          {children || "Generando..."}
        </>
      ) : (
        <>
          {showIcon && <Download className="h-4 w-4 mr-2" />}
          {children || "Descargar Remisión"}
        </>
      )}
    </Button>
  )
}
