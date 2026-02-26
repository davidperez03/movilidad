"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Download, Loader2, FileText } from "lucide-react"
import { pdf } from "@react-pdf/renderer"
import { DocumentoInspeccionPDF } from "./documento-inspeccion-pdf"

interface BotonDescargarInspeccionProps {
  inspeccionId: string
  placa: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
}

export function BotonDescargarInspeccion({
  inspeccionId,
  placa,
  size = "sm",
  variant = "outline",
  className = "",
  showIcon = true,
  children,
}: BotonDescargarInspeccionProps) {
  const [loading, setLoading] = useState(false)

  const descargarPDF = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // 1. Obtener datos de la inspección
      const { data: inspeccion, error: errorInspeccion } = await supabase
        .from("parq_vista_inspecciones")
        .select("*")
        .eq("id", inspeccionId)
        .single()

      if (errorInspeccion || !inspeccion) {
        toast.error("Error al cargar la inspección")
        return
      }

      // 2. Obtener firmas de la tabla de inspecciones
      const { data: firmas } = await supabase
        .from("parq_inspecciones")
        .select("firma_inspector, firma_operador")
        .eq("id", inspeccionId)
        .single()

      // 3. Obtener items de la inspección
      const { data: items, error: errorItems } = await supabase
        .from("parq_items_inspeccion")
        .select(`
          id,
          estado,
          observacion,
          foto_url,
          fotos,
          item_nombre,
          item_categoria,
          item_orden,
          subsanado,
          subsanado_observacion,
          item_catalogo:parq_items_catalogo (
            nombre,
            categoria,
            orden
          )
        `)
        .eq("inspeccion_id", inspeccionId)

      if (errorItems) {
        toast.error("Error al cargar los items")
        return
      }

      // Procesar items con fallback al catálogo
      const itemsProcesados = (items || [])
        .map((item) => ({
          id: item.id,
          estado: item.estado,
          observacion: item.observacion,
          foto_url: item.foto_url,
          fotos: (item.fotos as import("@/lib/parqueadero/types").FotoConTimestamp[] | null | undefined) ?? null,
          item_nombre: item.item_nombre || (item.item_catalogo as { nombre?: string; categoria?: string; orden?: number } | null)?.nombre || "Sin nombre",
          item_categoria: item.item_categoria || (item.item_catalogo as { nombre?: string; categoria?: string; orden?: number } | null)?.categoria || "otros",
          item_orden: item.item_orden ?? (item.item_catalogo as { nombre?: string; categoria?: string; orden?: number } | null)?.orden ?? 0,
          subsanado: item.subsanado,
          subsanado_observacion: item.subsanado_observacion,
        }))
        .sort((a, b) => a.item_orden - b.item_orden)

      // 4. Generar el PDF
      const documento = (
        <DocumentoInspeccionPDF
          inspeccion={{
            ...inspeccion,
            firma_inspector: firmas?.firma_inspector || null,
            firma_operador: firmas?.firma_operador || null,
          }}
          items={itemsProcesados}
        />
      )

      // 5. Convertir a blob y descargar
      const blob = await pdf(documento).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url

      // Nombre del archivo: Inspeccion_PLACA_FECHA.pdf
      const fecha = inspeccion.fecha?.substring(0, 10).replace(/-/g, "") || ""
      link.download = `Inspeccion_${placa}_${fecha}.pdf`
      link.click()
      URL.revokeObjectURL(url)

      toast.success("PDF descargado")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      toast.error("Error al generar el PDF")
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
          {showIcon && <FileText className="h-4 w-4 mr-2" />}
          {children || "Descargar PDF"}
        </>
      )}
    </Button>
  )
}
