export interface Usuario {
  id: string
  correo: string
  nombre_completo: string | null
  rol_global: 'usuario' | 'superadmin'
  activo: boolean
  url_avatar: string | null
  suspendido_hasta: string | null
  razon_suspension: string | null
  ultima_conexion: string | null
  creado_en: string
}

export interface ConfirmState {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  variant: 'default' | 'destructive'
  action: (() => Promise<void>) | null
}

export const CONFIRM_INITIAL: ConfirmState = {
  open: false,
  title: '',
  description: '',
  confirmLabel: 'Confirmar',
  variant: 'default',
  action: null,
}

export interface FiltrosUsuarios {
  busqueda: string
  rol_global: string
  activo: string
  modulo: string
}
