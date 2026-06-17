"use client"

import { Delete } from "lucide-react"

interface PinInputProps {
  value:    string
  onChange: (v: string) => void
  disabled?: boolean
}

const KEYS = ["1","2","3","4","5","6","7","8","9","","0","⌫"]

export function PinInput({ value, onChange, disabled }: PinInputProps) {
  const press = (key: string) => {
    if (disabled) return
    if (key === "⌫") {
      onChange(value.slice(0, -1))
    } else if (value.length < 4) {
      onChange(value + key)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-colors ${
              i < value.length
                ? "bg-foreground border-foreground"
                : "border-muted-foreground/40"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
        {KEYS.map((key, idx) => {
          if (key === "") return <div key={idx} />
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => press(key)}
              className={`
                h-14 sm:h-16 rounded-xl text-xl font-semibold
                border border-border bg-card
                active:scale-95 transition-all
                disabled:opacity-40
                ${key === "⌫"
                  ? "text-destructive"
                  : "hover:bg-accent"}
              `}
            >
              {key === "⌫" ? <Delete className="mx-auto h-5 w-5" /> : key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
