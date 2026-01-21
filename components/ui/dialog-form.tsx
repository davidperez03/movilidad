'use client'

import { ReactNode } from 'react'
import { Loader2, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface DialogFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  triggerLabel: string
  triggerIcon?: LucideIcon
  triggerVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon'
  submitLabel: string
  submitLoadingLabel?: string
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  children: ReactNode
  disabled?: boolean
}

export function DialogForm({
  open,
  onOpenChange,
  title,
  description,
  triggerLabel,
  triggerIcon: TriggerIcon,
  triggerVariant = 'outline',
  triggerSize = 'sm',
  submitLabel,
  submitLoadingLabel = 'Guardando...',
  loading,
  onSubmit,
  children,
  disabled = false,
}: DialogFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize} disabled={disabled}>
          {TriggerIcon && <TriggerIcon className="h-4 w-4 mr-2" />}
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {submitLoadingLabel}
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
