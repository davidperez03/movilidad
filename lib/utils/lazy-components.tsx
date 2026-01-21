'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Loading fallback for modals
function ModalLoadingFallback() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" />
      <Card className="relative z-50 w-full max-w-lg">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  )
}

// Lazy loaded modal components
export const LazyModalCrearUsuario = dynamic(
  () => import('@/components/superadmin/usuarios/modal-crear-usuario').then(mod => ({
    default: mod.ModalCrearUsuario
  })),
  {
    loading: ModalLoadingFallback,
    ssr: false,
  }
)

export const LazyModalEditarUsuario = dynamic(
  () => import('@/components/superadmin/usuarios/modal-editar-usuario').then(mod => ({
    default: mod.ModalEditarUsuario
  })),
  {
    loading: ModalLoadingFallback,
    ssr: false,
  }
)

export const LazyModalDetallesUsuario = dynamic(
  () => import('@/components/superadmin/usuarios/modal-detalles-usuario').then(mod => ({
    default: mod.ModalDetallesUsuario
  })),
  {
    loading: ModalLoadingFallback,
    ssr: false,
  }
)

// Loading fallback for PDF components
function PDFLoadingFallback() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-9 w-28" />
    </div>
  )
}

// Lazy loaded PDF component (heavy because of PDF generation)
export const LazyBotonDescargarRemision = dynamic(
  () => import('@/components/movilidad/pdf/boton-descargar-remision').then(mod => ({
    default: mod.BotonDescargarRemision
  })),
  {
    loading: PDFLoadingFallback,
    ssr: false,
  }
)
