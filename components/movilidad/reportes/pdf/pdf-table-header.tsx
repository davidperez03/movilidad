import { View, Text } from '@react-pdf/renderer'
import { basePdfStyles } from './base-pdf-styles'

interface ColumnaHeader {
  texto: string
  ancho: string | number
}

interface PdfTableHeaderProps {
  columnas: ColumnaHeader[]
}

export function PdfTableHeader({ columnas }: PdfTableHeaderProps) {
  return (
    <View style={basePdfStyles.tableHeader}>
      {columnas.map((columna, index) => (
        <Text key={index} style={[basePdfStyles.tableHeaderCell, { width: columna.ancho }]}>
          {columna.texto}
        </Text>
      ))}
    </View>
  )
}
