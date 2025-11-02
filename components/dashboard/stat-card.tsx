"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Car,
  ArrowRightLeft,
  ArrowDownToLine,
  AlertTriangle,
  TrendingUp,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number | string
  description?: string
  iconName: "car" | "arrow-right-left" | "arrow-down-to-line" | "alert-triangle" | "trending-up" | "activity"
  className?: string
}

const iconMap = {
  "car": Car,
  "arrow-right-left": ArrowRightLeft,
  "arrow-down-to-line": ArrowDownToLine,
  "alert-triangle": AlertTriangle,
  "trending-up": TrendingUp,
  "activity": Activity,
}

export function StatCard({ title, value, description, iconName, className }: StatCardProps) {
  const Icon = iconMap[iconName]

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}
