export type TipoReporteInv = 'stock' | 'cierres'

export interface FiltrosCierres {
  fechaInicio: string | null
  fechaFin:    string | null
  gruaId:      string
}

export const FILTROS_CIERRES_INICIALES: FiltrosCierres = {
  fechaInicio: null,
  fechaFin:    null,
  gruaId:      'todos',
}

export interface FilaStock {
  item_id:      string
  nombre:       string
  categoria:    string
  unidad:       string
  stock_minimo: number
  bodega:       number
  gruas:        Record<string, number>
  total:        number
}

export interface FilaSticker {
  item_id:      string
  nombre:       string
  rango_inicio: number
  rango_fin:    number
  usados:       number
  disponibles:  number
  stock_minimo: number
  pct_uso:      number
  configurado:  boolean
}

export interface FilaCierre {
  cierre_id:         string
  fecha:             string
  grua_placa:        string
  grua_id:           string
  item_id:           string
  item_nombre:       string
  unidad:            string
  cantidad_inicial:  number
  cantidad_final:    number
  cantidad_consumida: number
  registrado_por:    string | null
}
