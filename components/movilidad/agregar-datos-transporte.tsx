"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"
import { Truck, Loader2, ChevronsUpDown, Check, Plus } from "lucide-react"
import { useDialogForm } from "@/lib/hooks/use-dialog-form"
import { cn } from "@/lib/utils"

interface Empresa {
  id: string
  nombre: string
}

interface AgregarDatosTransporteProps {
  trasladoId: string
  empresaActualId?: string | null
  numeroGuiaActual?: string | null
}

export function AgregarDatosTransporte({
  trasladoId,
  empresaActualId,
  numeroGuiaActual
}: AgregarDatosTransporteProps) {
  const supabase = createClient()
  const { open, setOpen, loading, handleSubmit } = useDialogForm({
    successMessage: "Datos de transporte actualizados exitosamente",
  })

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [cargandoEmpresas, setCargandoEmpresas] = useState(false)
  const [openCombobox, setOpenCombobox] = useState(false)
  const [empresaSeleccionadaId, setEmpresaSeleccionadaId] = useState(empresaActualId || "")
  const [numeroGuia, setNumeroGuia] = useState(numeroGuiaActual || "")
  const [mostrarNuevaEmpresa, setMostrarNuevaEmpresa] = useState(false)
  const [nuevaEmpresa, setNuevaEmpresa] = useState("")

  // Cargar empresas cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      cargarEmpresas()
    }
  }, [open])

  const cargarEmpresas = async () => {
    setCargandoEmpresas(true)
    try {
      const { data, error } = await supabase
        .from("mov_empresas_transporte")
        .select("id, nombre")
        .eq("activo", true)
        .order("nombre")

      if (error) throw error
      setEmpresas(data || [])
    } catch (error) {
      toast.error("Error al cargar empresas de transporte")
    } finally {
      setCargandoEmpresas(false)
    }
  }

  const agregarNuevaEmpresa = async () => {
    if (!nuevaEmpresa.trim()) {
      toast.error("Ingrese el nombre de la empresa")
      return
    }

    try {
      const { data, error } = await supabase
        .from("mov_empresas_transporte")
        .insert({ nombre: nuevaEmpresa.trim() })
        .select()
        .single()

      if (error) {
        if (error.code === "23505") {
          toast.error("Esta empresa ya existe")
        } else {
          throw error
        }
        return
      }

      toast.success("Empresa agregada exitosamente")
      setEmpresas([...empresas, data])
      setEmpresaSeleccionadaId(data.id)
      setNuevaEmpresa("")
      setMostrarNuevaEmpresa(false)
      setOpenCombobox(false)
    } catch (error) {
      toast.error("Error al agregar la empresa")
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await handleSubmit(async () => {
      if (!empresaSeleccionadaId && !numeroGuia.trim()) {
        throw new Error("Debe ingresar al menos uno de los campos")
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("No hay sesión activa")
      }

      const updateData: any = {
        actualizado_por: user.id,
      }

      if (empresaSeleccionadaId) {
        updateData.empresa_transportadora_id = empresaSeleccionadaId
      }

      if (numeroGuia.trim()) {
        updateData.numero_guia = numeroGuia.trim()
      }

      const { error } = await supabase
        .from("mov_traslados")
        .update(updateData)
        .eq("id", trasladoId)

      if (error) {
        throw error
      }

      // Reset form after successful submission
      setOpen(false)
    }, {
      errorMessage: "Error al actualizar los datos de transporte"
    })
  }

  const yaHayDatos = empresaActualId || numeroGuiaActual

  const empresaSeleccionada = empresas.find(e => e.id === empresaSeleccionadaId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={yaHayDatos ? "outline" : "default"}>
          <Truck className="h-4 w-4 mr-2" />
          {yaHayDatos ? "Editar Datos de Transporte" : "Agregar Datos de Transporte"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Datos de Transporte</DialogTitle>
          <DialogDescription>
            Ingrese la información de la empresa transportadora y el número de guía del envío
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="empresa_transportadora">
              Empresa Transportadora
            </Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between"
                  disabled={loading || cargandoEmpresas}
                  type="button"
                >
                  {empresaSeleccionada?.nombre || "Seleccione una empresa..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar empresa..." />
                  <CommandList>
                    <CommandEmpty>
                      <div className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-2">No se encontró la empresa</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setMostrarNuevaEmpresa(true)}
                          type="button"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar nueva empresa
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setMostrarNuevaEmpresa(true)
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar nueva empresa
                      </CommandItem>
                      {empresas.map((empresa) => (
                        <CommandItem
                          key={empresa.id}
                          value={empresa.nombre}
                          onSelect={() => {
                            setEmpresaSeleccionadaId(empresa.id)
                            setOpenCombobox(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              empresaSeleccionadaId === empresa.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {empresa.nombre}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Formulario para agregar nueva empresa */}
            {mostrarNuevaEmpresa && (
              <div className="flex gap-2 p-3 bg-muted rounded-md">
                <Input
                  placeholder="Nombre de la empresa"
                  value={nuevaEmpresa}
                  onChange={(e) => setNuevaEmpresa(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      agregarNuevaEmpresa()
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={agregarNuevaEmpresa}
                >
                  Agregar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setMostrarNuevaEmpresa(false)
                    setNuevaEmpresa("")
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero_guia">
              Número de Guía
            </Label>
            <Input
              id="numero_guia"
              type="text"
              placeholder="Ej: 123456789"
              value={numeroGuia}
              onChange={(e) => setNumeroGuia(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Puede ingresar uno o ambos campos. Esta información será visible en el detalle del traslado.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || (!empresaSeleccionadaId && !numeroGuia.trim())}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
