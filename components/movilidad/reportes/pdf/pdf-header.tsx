import { View, Text } from '@react-pdf/renderer'
import { basePdfStyles } from './base-pdf-styles'

interface MetadataItem {
  label: string
  value: string | number
}

interface PdfHeaderProps {
  titulo: string
  subtitulo: string
  badge?: string
  metadata?: MetadataItem[]
}

export function PdfHeader({ titulo, subtitulo, badge, metadata }: PdfHeaderProps) {
  return (
    <>
      {/* Barra de encabezado con fondo oscuro */}
      <View style={basePdfStyles.headerBar}>
        <View style={basePdfStyles.headerBarLeft}>
          <Text style={basePdfStyles.headerTitle}>{titulo}</Text>
          <Text style={basePdfStyles.headerSubtitle}>{subtitulo}</Text>
        </View>
        {badge && (
          <View style={basePdfStyles.headerBadge}>
            <Text style={basePdfStyles.headerBadgeText}>{badge}</Text>
          </View>
        )}
      </View>

      {/* Barra de metadatos */}
      {metadata && metadata.length > 0 && (
        <View style={basePdfStyles.metadataBar}>
          {metadata.map((item, index) => (
            <View
              key={index}
              style={index === metadata.length - 1 ? basePdfStyles.metadataItemLast : basePdfStyles.metadataItem}
            >
              <Text style={basePdfStyles.metadataLabel}>{item.label.toUpperCase()}</Text>
              <Text style={basePdfStyles.metadataValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  )
}
