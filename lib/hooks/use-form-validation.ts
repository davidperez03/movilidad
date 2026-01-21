import { useState, useCallback } from 'react'

export interface ValidationRule {
  validate: (value: string) => boolean
  message: string
}

export interface FieldValidation {
  rules: ValidationRule[]
  required?: boolean
  requiredMessage?: string
}

export interface FieldState {
  value: string
  error: string | null
  touched: boolean
}

type FieldsConfig<T extends string> = Record<T, FieldValidation>

export function useFormValidation<T extends string>(fieldsConfig: FieldsConfig<T>) {
  const initialState = Object.keys(fieldsConfig).reduce((acc, key) => {
    acc[key as T] = { value: '', error: null, touched: false }
    return acc
  }, {} as Record<T, FieldState>)

  const [fields, setFields] = useState<Record<T, FieldState>>(initialState)

  const validateField = useCallback((name: T, value: string): string | null => {
    const config = fieldsConfig[name]

    if (config.required && !value.trim()) {
      return config.requiredMessage || 'Este campo es requerido'
    }

    for (const rule of config.rules) {
      if (!rule.validate(value)) {
        return rule.message
      }
    }

    return null
  }, [fieldsConfig])

  const setValue = useCallback((name: T, value: string) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error: prev[name].touched ? validateField(name, value) : null,
      }
    }))
  }, [validateField])

  const setTouched = useCallback((name: T) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched: true,
        error: validateField(name, prev[name].value),
      }
    }))
  }, [validateField])

  const validateAll = useCallback((): boolean => {
    let isValid = true
    const newFields = { ...fields }

    for (const name of Object.keys(fieldsConfig) as T[]) {
      const error = validateField(name, fields[name].value)
      newFields[name] = { ...newFields[name], touched: true, error }
      if (error) isValid = false
    }

    setFields(newFields)
    return isValid
  }, [fields, fieldsConfig, validateField])

  const reset = useCallback(() => {
    setFields(initialState)
  }, [initialState])

  const getFieldProps = useCallback((name: T) => ({
    value: fields[name].value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValue(name, e.target.value),
    onBlur: () => setTouched(name),
  }), [fields, setValue, setTouched])

  return {
    fields,
    setValue,
    setTouched,
    validateAll,
    reset,
    getFieldProps,
    isValid: Object.values(fields).every(f => !f.error),
  }
}

// Validadores comunes
export const validators = {
  placa: {
    validate: (value: string) => /^[A-Z0-9]{4,10}$/.test(value.toUpperCase()),
    message: 'La placa debe tener entre 4 y 10 caracteres alfanuméricos',
  },
  minLength: (min: number) => ({
    validate: (value: string) => value.length >= min,
    message: `Debe tener al menos ${min} caracteres`,
  }),
  maxLength: (max: number) => ({
    validate: (value: string) => value.length <= max,
    message: `Debe tener máximo ${max} caracteres`,
  }),
  email: {
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Ingrese un correo válido',
  },
  noSpecialChars: {
    validate: (value: string) => /^[a-zA-Z0-9\s]*$/.test(value),
    message: 'No se permiten caracteres especiales',
  },
}
