import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Control de Asistencia",
  description: "Registro de ingreso y salida - Parqueadero",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {children}
    </div>
  )
}
