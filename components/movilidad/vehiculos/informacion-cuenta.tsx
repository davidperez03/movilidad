import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateLong } from "@/lib/utils"

interface InformacionCuentaProps {
  cuenta: {
    creado_en: string
    tipo_servicio: string
    creador?: {
      nombre_completo: string
    }
  }
}

export function InformacionCuenta({ cuenta }: InformacionCuentaProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Cuenta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Creado por</p>
            <p className="font-medium">{cuenta.creador?.nombre_completo}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha de creación</p>
            <p className="font-medium">
              {formatDateLong(cuenta.creado_en)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tipo de servicio</p>
            <p className="font-medium capitalize">{cuenta.tipo_servicio}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
