"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Car,
  ArrowRightLeft,
  ArrowDownToLine,
  AlertTriangle,
  TrendingUp,
  Activity,
  LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number | string
  description?: string
  iconName: "car" | "arrow-right-left" | "arrow-down-to-line" | "alert-triangle" | "trending-up" | "activity"
  color?: "blue" | "purple" | "green" | "orange" | "red"
  className?: string
}

const iconMap: Record<string, LucideIcon> = {
  "car": Car,
  "arrow-right-left": ArrowRightLeft,
  "arrow-down-to-line": ArrowDownToLine,
  "alert-triangle": AlertTriangle,
  "trending-up": TrendingUp,
  "activity": Activity,
}

const colorMap = {
  blue: {
    bg: "bg-blue-100",
    icon: "text-blue-600",
    value: "text-blue-600",
  },
  purple: {
    bg: "bg-purple-100",
    icon: "text-purple-600",
    value: "text-purple-600",
  },
  green: {
    bg: "bg-green-100",
    icon: "text-green-600",
    value: "text-green-600",
  },
  orange: {
    bg: "bg-orange-100",
    icon: "text-orange-600",
    value: "text-orange-600",
  },
  red: {
    bg: "bg-red-100",
    icon: "text-red-600",
    value: "text-red-600",
  },
}

export function StatCard({
  title,
  value,
  iconName,
  color = "blue",
  className
}: StatCardProps) {
  const Icon = iconMap[iconName]
  const colors = colorMap[color]

  return (
    <Card className={cn("transition-all hover:shadow-sm", className)}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("rounded-lg p-2", colors.bg)}>
          <Icon className={cn("h-4 w-4", colors.icon)} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-2xl font-bold", colors.value)}>{value}</span>
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
      </CardContent>
    </Card>
  )
}
