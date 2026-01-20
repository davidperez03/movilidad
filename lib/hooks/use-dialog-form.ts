'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface UseDialogFormOptions {
  /**
   * Mensaje de éxito que se muestra al completar la acción
   */
  successMessage?: string

  /**
   * Callback que se ejecuta después de un submit exitoso
   */
  onSuccess?: () => void

  /**
   * Si true, ejecuta router.refresh() después del éxito
   * @default true
   */
  refreshOnSuccess?: boolean
}

interface UseDialogFormReturn<T = unknown> {
  /** Estado de apertura del dialog */
  open: boolean

  /** Función para cambiar el estado de apertura */
  setOpen: (open: boolean) => void

  /** Estado de carga durante el submit */
  loading: boolean

  /** Función wrapper para manejar el submit con manejo automático de loading y errores */
  handleSubmit: (
    action: () => Promise<T>,
    options?: {
      /** Mensaje de error personalizado */
      errorMessage?: string
      /** Mensaje de éxito personalizado (sobrescribe el del constructor) */
      successMessage?: string
      /** Si false, no cierra el dialog automáticamente */
      closeOnSuccess?: boolean
    }
  ) => Promise<void>

  /** Router de Next.js para refresh manual si es necesario */
  router: ReturnType<typeof useRouter>
}

/**
 * Hook personalizado para manejar formularios en Dialogs
 *
 * Encapsula la lógica común de:
 * - Estados de open y loading
 * - Manejo automático de try/catch/finally
 * - Toast de éxito/error
 * - Cierre del dialog
 * - Refresh del router
 *
 * @example
 * ```tsx
 * const { open, setOpen, loading, handleSubmit } = useDialogForm({
 *   successMessage: "Novedad agregada exitosamente"
 * })
 *
 * const onSubmit = async (e: React.FormEvent) => {
 *   e.preventDefault()
 *   await handleSubmit(async () => {
 *     await supabase.from("tabla").insert(...)
 *   })
 * }
 * ```
 */
export function useDialogForm<T = unknown>(
  options: UseDialogFormOptions = {}
): UseDialogFormReturn<T> {
  const {
    successMessage = 'Operación completada exitosamente',
    onSuccess,
    refreshOnSuccess = true,
  } = options

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (
    action: () => Promise<T>,
    submitOptions?: {
      errorMessage?: string
      successMessage?: string
      closeOnSuccess?: boolean
    }
  ): Promise<void> => {
    const {
      errorMessage = 'Error al realizar la operación',
      successMessage: customSuccessMessage,
      closeOnSuccess = true
    } = submitOptions || {}

    setLoading(true)

    try {
      await action()

      // Usar el mensaje personalizado si se proporciona, sino el del constructor
      toast.success(customSuccessMessage || successMessage)

      if (closeOnSuccess) {
        setOpen(false)
      }

      if (refreshOnSuccess) {
        router.refresh()
      }

      onSuccess?.()
    } catch (error) {
      const message = error instanceof Error
        ? `${errorMessage}: ${error.message}`
        : errorMessage
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return {
    open,
    setOpen,
    loading,
    handleSubmit,
    router,
  }
}
