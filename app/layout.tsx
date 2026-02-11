import type React from "react"
import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, JetBrains_Mono, Share_Tech_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SessionProvider } from "@/components/session-provider"
import { Toaster } from "sonner"
import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" })
const shareTechMono = Share_Tech_Mono({ weight: "400", subsets: ["latin"], variable: "--font-share-tech-mono" })

export const metadata: Metadata = {
  title: "Movilidad",
  description: "Sistema de Gestión de Movilidad",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Movilidad",
  },
}

export const viewport: Viewport = {
  themeColor: "#171717",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${plusJakarta.variable} ${jetbrainsMono.variable} ${shareTechMono.variable} font-sans antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster position="top-right" richColors closeButton />
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                })
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
