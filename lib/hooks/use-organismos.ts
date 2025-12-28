'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Organismo {
  id: string
  nombre: string
  municipio: string
  departamento: string
}

export function useOrganismos() {
  const [organismos, setOrganismos] = useState<Organismo[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargarOrganismos() {
      try {
        setCargando(true)
        setError(null)

        const supabase = createClient()
        const { data, error: errorOrganismos } = await supabase
          .from('mov_organismos_transito')
          .select('id, nombre, municipio, departamento')
          .order('nombre')

        if (errorOrganismos) {
          setError('Error al cargar organismos de tránsito')
          return
        }

        setOrganismos(data || [])
      } catch (err) {
        setError('Error inesperado al cargar organismos')
      } finally {
        setCargando(false)
      }
    }

    cargarOrganismos()
  }, [])

  return {
    organismos,
    cargando,
    error,
  }
}
