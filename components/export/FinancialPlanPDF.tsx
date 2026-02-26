import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a' },
  header: { marginBottom: 20, borderBottom: 2, borderBottomColor: '#B15082', paddingBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 4, color: '#B15082' },
  subtitle: { fontSize: 12, color: '#666' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 8, backgroundColor: '#f8f0f4', padding: 6, color: '#B15082' },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 160, fontWeight: 'bold', color: '#444' },
  value: { flex: 1 },
  listItem: { marginBottom: 3, paddingLeft: 10 },
  subSection: { marginBottom: 8, paddingLeft: 10 },
  subTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#999' },
  pageNumber: { position: 'absolute', bottom: 15, right: 40, fontSize: 8, color: '#999' },
  numberedItem: { flexDirection: 'row', marginBottom: 6 },
  number: { width: 24, fontWeight: 'bold', color: '#B15082', fontSize: 11 },
  itemContent: { flex: 1 },
  priorityHigh: { fontSize: 9, color: '#dc2626', fontWeight: 'bold' },
  priorityMedium: { fontSize: 9, color: '#d97706', fontWeight: 'bold' },
  priorityLow: { fontSize: 9, color: '#059669', fontWeight: 'bold' },
  separator: { borderBottom: 1, borderBottomColor: '#e0e0e0', marginVertical: 8 },
})

interface FinancialPlanPDFProps {
  plan: {
    obiettiviFinanziari: any
    analisiGap: any
    sequenzaRaccomandata: any
    raccomandazioniProdotti: any
    sintesiValore: any
    spuntiFiscali: any
  }
  clientName: string
  createdAt?: string
}

function renderJsonSection(data: any, depth = 0): any {
  if (!data) return null

  if (typeof data === 'string') {
    return <Text style={{ marginBottom: 3, paddingLeft: depth * 10 }}>{data}</Text>
  }

  if (Array.isArray(data)) {
    return data.map((item, i) => {
      if (typeof item === 'string') {
        return <Text key={i} style={styles.listItem}>- {item}</Text>
      }
      if (typeof item === 'object' && item !== null) {
        const title = item.titolo || item.nome || item.obiettivo || item.prodotto || item.area || item.categoria || item.step || ''
        const desc = item.descrizione || item.dettaglio || item.motivazione || item.valore || ''
        const priorita = item.priorita || item.urgenza || ''
        const termine = item.termine || item.orizzonte || ''

        return (
          <View key={i} style={styles.numberedItem}>
            <Text style={styles.number}>{i + 1}.</Text>
            <View style={styles.itemContent}>
              {title && <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>{title}</Text>}
              {desc && <Text style={{ marginBottom: 2, color: '#555' }}>{desc}</Text>}
              {(priorita || termine) && (
                <Text style={{ fontSize: 9, color: '#777' }}>
                  {priorita ? `Priorita: ${priorita}` : ''}{priorita && termine ? ' | ' : ''}{termine ? `Termine: ${termine}` : ''}
                </Text>
              )}
            </View>
          </View>
        )
      }
      return null
    })
  }

  if (typeof data === 'object') {
    return Object.entries(data).map(([key, val]) => {
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        const labelText = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        return (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>{labelText}:</Text>
            <Text style={styles.value}>{String(val)}</Text>
          </View>
        )
      }
      if (Array.isArray(val) && val.length > 0) {
        const labelText = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        return (
          <View key={key} style={styles.subSection}>
            <Text style={styles.subTitle}>{labelText}:</Text>
            {renderJsonSection(val, depth + 1)}
          </View>
        )
      }
      return null
    })
  }

  return null
}

export function FinancialPlanPDF({ plan, clientName, createdAt }: FinancialPlanPDFProps) {
  const dataGenerazione = createdAt
    ? new Date(createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <Document>
      {/* PAGE 1 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Piano Finanziario Premium</Text>
          <Text style={styles.subtitle}>Cliente: {clientName} | Generato il {dataGenerazione}</Text>
        </View>

        {/* Obiettivi Finanziari */}
        {plan.obiettiviFinanziari && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Obiettivi Finanziari</Text>
            {renderJsonSection(plan.obiettiviFinanziari)}
          </View>
        )}

        {/* Analisi Gap */}
        {plan.analisiGap && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Analisi Gap</Text>
            {renderJsonSection(plan.analisiGap)}
          </View>
        )}

        <Text style={styles.footer}>Documento confidenziale generato da LEO-FODI - Solo per uso interno Leonardo Assicurazioni</Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>

      {/* PAGE 2 */}
      <Page size="A4" style={styles.page}>
        {/* Sequenza Raccomandata */}
        {plan.sequenzaRaccomandata && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Sequenza Raccomandata</Text>
            {renderJsonSection(plan.sequenzaRaccomandata)}
          </View>
        )}

        {/* Raccomandazioni Prodotti */}
        {plan.raccomandazioniProdotti && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Raccomandazioni Prodotti</Text>
            {renderJsonSection(plan.raccomandazioniProdotti)}
          </View>
        )}

        <Text style={styles.footer}>Documento confidenziale generato da LEO-FODI - Solo per uso interno Leonardo Assicurazioni</Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>

      {/* PAGE 3 */}
      <Page size="A4" style={styles.page}>
        {/* Spunti Fiscali */}
        {plan.spuntiFiscali && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Spunti Fiscali</Text>
            {renderJsonSection(plan.spuntiFiscali)}
          </View>
        )}

        {/* Sintesi Valore */}
        {plan.sintesiValore && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Sintesi Valore</Text>
            {renderJsonSection(plan.sintesiValore)}
          </View>
        )}

        <Text style={styles.footer}>Documento confidenziale generato da LEO-FODI - Solo per uso interno Leonardo Assicurazioni</Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  )
}
