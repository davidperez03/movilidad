import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface EmptyStateProps {
  /**
   * Ícono que se muestra en el estado vacío
   */
  icon: LucideIcon

  /**
   * Título principal del estado vacío
   */
  titulo: string

  /**
   * Descripción opcional del estado vacío
   */
  descripcion?: string

  /**
   * Acción opcional (botón, link, etc.)
   */
  accion?: ReactNode
}

/**
 * Componente reutilizable para mostrar estados vacíos de manera consistente
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={ArrowRightLeft}
 *   titulo="No hay traslados activos"
 *   descripcion="No hay procesos de traslado en curso"
 *   accion={
 *     <Button asChild>
 *       <Link href="/nuevo">
 *         <Plus className="h-4 w-4 mr-2" />
 *         Crear Traslado
 *       </Link>
 *     </Button>
 *   }
 * />
 * ```
 */
export function EmptyState({ icon: Icon, titulo, descripcion, accion }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">{titulo}</p>
        {descripcion && (
          <p className="text-muted-foreground mb-4">{descripcion}</p>
        )}
        {accion}
      </CardContent>
    </Card>
  )
}
