'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { TipoProceso } from '@/lib/movilidad/config'

export interface DatosCuenta {
  id: string
  placa: string
  numero_cuenta: string
}

export function useBuscarVehiculo(tipoProceso: TipoProceso) {
  const [cuentaId, setCuentaId] = useState<string | null>(null)
  const [numeroCuenta, setNumeroCuenta] = useState("")
  const [placaActual, setPlacaActual] = useState("")
  const [buscando, setBuscando] = useState(false)
  const [modalProcesoActivo, setModalProcesoActivo] = useState(false)
  const [razonRechazo, setRazonRechazo] = useState("")

  const buscarCuenta = async (placaBuscar: string) => {
    if (!placaBuscar.trim()) {
      toast.error("Ingrese una placa para buscar")
      return
    }

    setBuscando(true)
    try {
      const supabase = createClient()
      const placaNormalizada = placaBuscar.trim().toUpperCase()

      // Buscar cuenta
      const { data: cuenta, error: errorCuenta } = await supabase
        .from("mov_cuentas_vehiculos")
        .select("*")
        .eq("placa", placaNormalizada)
        .single()

      if (errorCuenta || !cuenta) {
        toast.error(`No se encontró una cuenta con la placa ${placaNormalizada}`)
        limpiarDatos()
        return
      }

      // Verificar si puede iniciar proceso usando la función de la BD
      const { data: validacion, error: errorValidacion } = await supabase
        .rpc("puede_iniciar_proceso", {
          p_placa: placaNormalizada,
          p_tipo_proceso: tipoProceso
        })

      if (errorValidacion) {
        toast.error("Error al validar el vehículo")
        return
      }

      if (validacion && validacion.length > 0 && !validacion[0].puede_iniciar) {
        setRazonRechazo(validacion[0].razon)
        setModalProcesoActivo(true)
        limpiarDatos()
        return
      }

      // Todo OK, asignar cuenta
      setCuentaId(cuenta.id)
      setNumeroCuenta(cuenta.numero_cuenta)
      setPlacaActual(cuenta.placa)
      toast.success(`Vehículo encontrado: ${cuenta.placa} - ${cuenta.numero_cuenta}`)
    } catch (error) {
      toast.error("Error al buscar la cuenta")
    } finally {
      setBuscando(false)
    }
  }

  const limpiarDatos = () => {
    setCuentaId(null)
    setNumeroCuenta("")
    setPlacaActual("")
  }

  const cerrarModalProcesoActivo = () => {
    setModalProcesoActivo(false)
    setRazonRechazo("")
  }

  return {
    cuentaId,
    numeroCuenta,
    placaActual,
    buscando,
    modalProcesoActivo,
    razonRechazo,
    buscarCuenta,
    limpiarDatos,
    cerrarModalProcesoActivo,
  }
}
