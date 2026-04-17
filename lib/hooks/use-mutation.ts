'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface MutateOptions {
  successMessage?: string
  onSuccess?: () => void
  refresh?: boolean
}

export function useMutation() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function mutate(
    action: () => Promise<{ ok: boolean; error?: string }>,
    opts: MutateOptions = {}
  ) {
    if (pending) return
    startTransition(async () => {
      const { ok, error } = await action()
      if (!ok) {
        toast.error(error ?? 'Error al procesar la solicitud')
        return
      }
      if (opts.successMessage) toast.success(opts.successMessage)
      opts.onSuccess?.()
      if (opts.refresh !== false) router.refresh()
    })
  }

  return { mutate, pending }
}
