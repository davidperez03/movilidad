import { Badge } from "@/components/ui/badge"
import { Circle, Clock, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "nuevo" | "en_progreso" | "resuelto" | "cerrado"
  className?: string
}

const statusConfig = {
  nuevo: {
    label: "Nuevo",
    icon: Circle,
    className: "bg-blue-500/10 text-blue-700 border-blue-500/30 hover:bg-blue-500/20",
  },
  en_progreso: {
    label: "En Progreso",
    icon: Clock,
    className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/20",
  },
  resuelto: {
    label: "Resuelto",
    icon: CheckCircle2,
    className: "bg-green-500/10 text-green-700 border-green-500/30 hover:bg-green-500/20",
  },
  cerrado: {
    label: "Cerrado",
    icon: XCircle,
    className: "bg-gray-500/10 text-gray-700 border-gray-500/30 hover:bg-gray-500/20",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  )
}
