"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

interface Organismo {
  id: string
  nombre: string
  municipio: string
  departamento: string
}

interface ComboboxOrganismosProps {
  organismos: Organismo[]
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
}

export function ComboboxOrganismos({
  organismos,
  value,
  onValueChange,
  disabled = false,
  placeholder = "Seleccione un organismo...",
  searchPlaceholder = "Buscar organismo...",
  emptyMessage = "No se encontró ningún organismo.",
  className,
}: ComboboxOrganismosProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOrganismo = organismos.find((org) => org.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedOrganismo ? (
            <span className="truncate">
              {selectedOrganismo.nombre} - {selectedOrganismo.municipio}, {selectedOrganismo.departamento}
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[95vw] sm:w-[500px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {organismos.map((organismo) => (
                <CommandItem
                  key={organismo.id}
                  value={`${organismo.nombre} ${organismo.municipio} ${organismo.departamento}`}
                  onSelect={() => {
                    onValueChange(organismo.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === organismo.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{organismo.nombre}</span>
                    <span className="text-xs text-muted-foreground">
                      {organismo.municipio}, {organismo.departamento}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
