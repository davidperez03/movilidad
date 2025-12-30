import { View, Text } from '@react-pdf/renderer'
import { basePdfStyles } from './base-pdf-styles'

interface PdfHeaderProps {
  titulo: string
  subtitulo: string
  metadata?: {
    label: string
    value: string | number
  }[]
}

export function PdfHeader({ titulo, subtitulo, metadata }: PdfHeaderProps) {
  return (
    <>
      <View style={basePdfStyles.header}>
        <Text style={basePdfStyles.title}>{titulo}</Text>
        <Text style={basePdfStyles.subtitle}>{subtitulo}</Text>
      </View>

      {metadata && metadata.length > 0 && (
        <View style={basePdfStyles.metadata}>
          {metadata.map((item, index) => (
            <Text key={index}>
              {item.label}: {item.value}
            </Text>
          ))}
        </View>
      )}
    </>
  )
}
