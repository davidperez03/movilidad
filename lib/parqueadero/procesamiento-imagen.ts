import { getNowTimestampColombia } from '@/lib/utils/date'

/**
 * Dibuja un rectángulo con esquinas redondeadas en el canvas
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * Procesa una imagen agregando:
 * - Marca de fecha/hora en esquina inferior derecha
 * - Badge de origen (CAMARA o GALERIA) en esquina inferior izquierda
 *
 * @param file Archivo de imagen
 * @param timestamp Timestamp opcional (si no se provee, usa timestamp actual de Colombia)
 * @param origen 'camera' para fotos tomadas con cámara, 'upload' para subidas desde galería
 * @returns Promise con File procesado
 */
export async function procesarImagenConTimestamp(
  file: File,
  timestamp?: string,
  origen: 'camera' | 'upload' = 'camera'
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('No se pudo obtener contexto 2D del canvas'))
          return
        }

        canvas.width = img.width
        canvas.height = img.height

        // Dibujar imagen original
        ctx.drawImage(img, 0, 0)

        // === CONFIGURACIÓN BASE ===
        const fontSize = Math.max(img.width * 0.028, 18)
        const padding = Math.max(img.width * 0.012, 8)
        const cornerRadius = Math.max(4, fontSize * 0.25)
        const ts = timestamp || getNowTimestampColombia()

        // === TIMESTAMP (esquina inferior derecha) ===
        ctx.font = `bold ${fontSize}px Arial, sans-serif`
        const fechaFormateada = formatearTimestampParaImagen(ts)
        const tsTextWidth = ctx.measureText(fechaFormateada).width
        const tsPadX = fontSize * 0.55
        const tsPadY = fontSize * 0.4
        const tsBgWidth = tsTextWidth + tsPadX * 2
        const tsBgHeight = fontSize + tsPadY * 2
        const tsBgX = canvas.width - tsBgWidth - padding
        const tsBgY = canvas.height - tsBgHeight - padding

        // Fondo del timestamp: negro semi-transparente con bordes redondeados
        ctx.fillStyle = 'rgba(0, 0, 0, 0.72)'
        roundRect(ctx, tsBgX, tsBgY, tsBgWidth, tsBgHeight, cornerRadius)
        ctx.fill()

        // Texto del timestamp en blanco
        ctx.fillStyle = 'rgba(255, 255, 255, 0.96)'
        ctx.font = `bold ${fontSize}px Arial, sans-serif`
        ctx.fillText(fechaFormateada, tsBgX + tsPadX, tsBgY + tsPadY + fontSize * 0.85)

        // === BADGE DE ORIGEN (esquina inferior izquierda) ===
        const badgeFontSize = Math.max(img.width * 0.022, 13)
        ctx.font = `bold ${badgeFontSize}px Arial, sans-serif`

        const isCamera = origen === 'camera'
        const badgeLabel = isCamera ? 'CAMARA' : 'GALERIA *'
        const badgeTextWidth = ctx.measureText(badgeLabel).width
        const badgePadX = badgeFontSize * 0.6
        const badgePadY = badgeFontSize * 0.4
        const badgeBgWidth = badgeTextWidth + badgePadX * 2
        const badgeBgHeight = badgeFontSize + badgePadY * 2
        const badgeBgX = padding
        const badgeBgY = canvas.height - badgeBgHeight - padding

        // Color del badge según origen
        ctx.fillStyle = isCamera
          ? 'rgba(22, 163, 74, 0.88)'   // Verde para cámara
          : 'rgba(234, 88, 12, 0.88)'   // Naranja para galería

        roundRect(ctx, badgeBgX, badgeBgY, badgeBgWidth, badgeBgHeight, cornerRadius)
        ctx.fill()

        // Texto del badge
        ctx.fillStyle = 'rgba(255, 255, 255, 0.96)'
        ctx.font = `bold ${badgeFontSize}px Arial, sans-serif`
        ctx.fillText(badgeLabel, badgeBgX + badgePadX, badgeBgY + badgePadY + badgeFontSize * 0.85)

        // Convertir canvas a Blob y crear nuevo File
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al convertir canvas a blob'))
              return
            }

            const newFile = new File([blob], file.name, { type: 'image/jpeg' })
            resolve(newFile)
          },
          'image/jpeg',
          0.92
        )
      }

      img.onerror = () => reject(new Error('Error al cargar la imagen'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsDataURL(file)
  })
}

/**
 * Formatea timestamp para mostrar en imagen
 * @param timestamp ISO timestamp
 * @returns Formato: "DD/MM/YYYY HH:MM"
 */
export function formatearTimestampParaImagen(timestamp: string): string {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  if (isNaN(d.getTime())) return ''

  const dia = d.getDate().toString().padStart(2, '0')
  const mes = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()
  const hora = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')

  return `${dia}/${mes}/${year} ${hora}:${min}`
}

/**
 * Optimiza imagen para móvil si es demasiado grande
 * @param file Archivo de imagen
 * @param maxWidth Ancho máximo (default 1920px)
 * @param maxHeight Alto máximo (default 1080px)
 * @returns Promise con File optimizado
 */
export async function optimizarImagenParaMovil(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        // Si la imagen ya es pequeña, no optimizar
        if (img.width <= maxWidth && img.height <= maxHeight) {
          resolve(file)
          return
        }

        // Calcular nuevas dimensiones manteniendo aspect ratio
        let newWidth = img.width
        let newHeight = img.height

        if (newWidth > maxWidth) {
          newHeight = (newHeight * maxWidth) / newWidth
          newWidth = maxWidth
        }

        if (newHeight > maxHeight) {
          newWidth = (newWidth * maxHeight) / newHeight
          newHeight = maxHeight
        }

        const canvas = document.createElement('canvas')
        canvas.width = newWidth
        canvas.height = newHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('No se pudo obtener contexto 2D'))
          return
        }

        ctx.drawImage(img, 0, 0, newWidth, newHeight)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al optimizar imagen'))
              return
            }

            const newFile = new File([blob], file.name, { type: 'image/jpeg' })
            resolve(newFile)
          },
          'image/jpeg',
          0.85
        )
      }

      img.onerror = () => reject(new Error('Error al cargar imagen'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Error al leer archivo'))
    reader.readAsDataURL(file)
  })
}

/**
 * Comprime una imagen hasta alcanzar un tamaño objetivo en bytes.
 * Primero escala dimensiones, luego reduce calidad JPEG iterativamente.
 *
 * @param file Archivo de imagen (acepta hasta ~20MB)
 * @param targetBytes Tamaño máximo deseado en bytes (default 2MB)
 * @param maxWidth Ancho máximo antes de comprimir (default 1920px)
 * @param maxHeight Alto máximo antes de comprimir (default 1080px)
 * @returns Promise con File comprimido y bandera de si fue comprimido
 */
export async function comprimirHastaTarget(
  file: File,
  targetBytes: number = 2 * 1024 * 1024,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<{ file: File; fueComprimida: boolean }> {
  // Si ya está dentro del límite, no hacer nada
  if (file.size <= targetBytes) {
    return { file, fueComprimida: false }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        // Paso 1: calcular dimensiones escaladas
        let newWidth = img.width
        let newHeight = img.height

        if (newWidth > maxWidth) {
          newHeight = Math.round((newHeight * maxWidth) / newWidth)
          newWidth = maxWidth
        }

        if (newHeight > maxHeight) {
          newWidth = Math.round((newWidth * maxHeight) / newHeight)
          newHeight = maxHeight
        }

        const canvas = document.createElement('canvas')
        canvas.width = newWidth
        canvas.height = newHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('No se pudo obtener contexto 2D'))
          return
        }

        ctx.drawImage(img, 0, 0, newWidth, newHeight)

        // Paso 2: intentar calidades decrecientes hasta cumplir el target
        const calidades = [0.85, 0.75, 0.65, 0.55, 0.45, 0.35]
        let intentoIdx = 0

        const intentarCalidad = () => {
          const calidad = calidades[intentoIdx]

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Error al comprimir imagen'))
                return
              }

              if (blob.size <= targetBytes || intentoIdx >= calidades.length - 1) {
                const newFile = new File([blob], file.name, { type: 'image/jpeg' })
                resolve({ file: newFile, fueComprimida: true })
              } else {
                intentoIdx++
                intentarCalidad()
              }
            },
            'image/jpeg',
            calidad
          )
        }

        intentarCalidad()
      }

      img.onerror = () => reject(new Error('Error al cargar imagen'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Error al leer archivo'))
    reader.readAsDataURL(file)
  })
}
