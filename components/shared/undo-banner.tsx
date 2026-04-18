'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Undo2 } from 'lucide-react'

interface UndoBannerProps {
  mensaje:    string
  duracion?:  number
  onDeshacer: () => void
  onDismiss:  () => void
}


export function UndoBanner({ mensaje, duracion = 10000, onDeshacer, onDismiss }: UndoBannerProps) {
  const [progreso, setProgreso] = useState(100)

  useEffect(() => {
    const intervalo  = 50
    const decremento = 100 / (duracion / intervalo)
    let actual = 100

    const timer = setInterval(() => {
      actual -= decremento
      if (actual <= 0) {
        clearInterval(timer)
        onDismiss()
      } else {
        setProgreso(actual)
      }
    }, intervalo)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 sm:px-0">
      <div className="rounded-xl border bg-background shadow-xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
          <span className="flex-1 text-sm font-medium">{mensaje}</span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs gap-1.5 shrink-0"
            onClick={() => { onDeshacer(); onDismiss() }}
          >
            <Undo2 className="h-3 w-3" />
            Deshacer
          </Button>
        </div>
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-green-500 transition-none"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>
    </div>
  )
}
