"use client"

import { Check, X } from "lucide-react"

const requirements = [
  { label: "Minimo 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Una letra mayuscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Una letra minuscula", test: (p: string) => /[a-z]/.test(p) },
  { label: "Un numero", test: (p: string) => /[0-9]/.test(p) },
  { label: "Un caracter especial (ej: . ! @ # $ % & *)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export function validatePassword(password: string): boolean {
  return requirements.every((req) => req.test(password))
}

export function PasswordRequirements({ password }: { password: string }) {
  if (!password) return null

  return (
    <ul className="space-y-1 mt-2">
      {requirements.map((req) => {
        const passed = req.test(password)
        return (
          <li
            key={req.label}
            className={`flex items-center gap-2 text-xs ${
              passed ? "text-green-600" : "text-muted-foreground"
            }`}
          >
            {passed ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            {req.label}
          </li>
        )
      })}
    </ul>
  )
}
