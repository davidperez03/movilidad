'use client'

import { useEffect, useRef, useCallback, ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AccessibleModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
  showCloseButton?: boolean
}

export function AccessibleModal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  showCloseButton = true,
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement?.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement?.focus()
    }
  }, [])

  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement

      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('keydown', handleTabKey)

      document.body.style.overflow = 'hidden'

      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        firstFocusable?.focus()
      }, 0)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keydown', handleTabKey)
      document.body.style.overflow = ''

      previousActiveElement.current?.focus()
    }
  }, [open, handleKeyDown, handleTabKey])

  if (!open) return null

  const titleId = `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`
  const descId = description ? `modal-desc-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      role="presentation"
    >
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <Card
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={cn('relative z-50 w-full max-w-lg', className)}
      >
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <div className="sr-only">
          <h2 id={titleId}>{title}</h2>
          {description && <p id={descId}>{description}</p>}
        </div>

        {children}
      </Card>
    </div>
  )
}
