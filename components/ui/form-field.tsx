import { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  name: string
  error?: string | null
  touched?: boolean
  required?: boolean
  description?: string
  children?: ReactNode
}

export function FormField({
  label,
  name,
  error,
  touched,
  required,
  description,
  children,
}: FormFieldProps) {
  const showError = touched && error

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {showError ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: string
  error?: string | null
  touched?: boolean
  required?: boolean
  description?: string
}

export function FormInput({
  label,
  name,
  error,
  touched,
  required,
  description,
  className,
  ...props
}: FormInputProps) {
  const showError = touched && error

  return (
    <FormField
      label={label}
      name={name}
      error={error}
      touched={touched}
      required={required}
      description={description}
    >
      <Input
        id={name}
        name={name}
        className={cn(showError && 'border-destructive focus-visible:ring-destructive', className)}
        {...props}
      />
    </FormField>
  )
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  name: string
  error?: string | null
  touched?: boolean
  required?: boolean
  description?: string
}

export function FormTextarea({
  label,
  name,
  error,
  touched,
  required,
  description,
  className,
  ...props
}: FormTextareaProps) {
  const showError = touched && error

  return (
    <FormField
      label={label}
      name={name}
      error={error}
      touched={touched}
      required={required}
      description={description}
    >
      <Textarea
        id={name}
        name={name}
        className={cn(showError && 'border-destructive focus-visible:ring-destructive', className)}
        {...props}
      />
    </FormField>
  )
}
