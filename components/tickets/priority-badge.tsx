import { Badge } from "@/components/ui/badge"
import { ArrowDown, Minus, ArrowUp, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PriorityBadgeProps {
  priority: "baja" | "media" | "alta" | "urgente"
  className?: string
}

const priorityConfig = {
  baja: {
    label: "Baja",
    icon: ArrowDown,
    className: "bg-gray-500/10 text-gray-700 border-gray-500/30 hover:bg-gray-500/20",
  },
  media: {
    label: "Media",
    icon: Minus,
    className: "bg-blue-500/10 text-blue-700 border-blue-500/30 hover:bg-blue-500/20",
  },
  alta: {
    label: "Alta",
    icon: ArrowUp,
    className: "bg-orange-500/10 text-orange-700 border-orange-500/30 hover:bg-orange-500/20",
  },
  urgente: {
    label: "Urgente",
    icon: AlertTriangle,
    className: "bg-red-500/10 text-red-700 border-red-500/30 hover:bg-red-500/20",
  },
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  )
}
