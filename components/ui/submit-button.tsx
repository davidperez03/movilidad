'use client'

import { Loader2, LucideIcon } from 'lucide-react'
import { Button, ButtonProps } from '@/components/ui/button'

interface SubmitButtonProps extends Omit<ButtonProps, 'type'> {
  loading: boolean
  loadingText?: string
  icon?: LucideIcon
}

export function SubmitButton({
  loading,
  loadingText = 'Guardando...',
  icon: Icon,
  children,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={loading || disabled} {...props}>
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4 mr-2" />}
          {children}
        </>
      )}
    </Button>
  )
}
