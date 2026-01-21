import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

type AlertVariant = 'success' | 'error' | 'warning' | 'info' | 'orange'

interface AlertBoxProps {
  variant: AlertVariant
  title?: string
  children: ReactNode
  className?: string
  showIcon?: boolean
}

const variantStyles: Record<AlertVariant, string> = {
  success: 'bg-green-50 border-green-200 text-green-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  orange: 'bg-orange-50 border-orange-200 text-orange-900',
}

const variantIcons: Record<AlertVariant, typeof AlertCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  orange: AlertTriangle,
}

const iconColors: Record<AlertVariant, string> = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
  orange: 'text-orange-600',
}

export function AlertBox({
  variant,
  title,
  children,
  className,
  showIcon = true,
}: AlertBoxProps) {
  const Icon = variantIcons[variant]

  return (
    <div
      className={cn(
        'p-4 border rounded-md',
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      <div className="flex gap-3">
        {showIcon && (
          <Icon
            className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColors[variant])}
            aria-hidden="true"
          />
        )}
        <div className="flex-1">
          {title && (
            <p className="font-medium text-sm mb-1">{title}</p>
          )}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}
