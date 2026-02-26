import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { CompleteOSINTProfile } from '@/lib/osint/types'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a' },
  header: { marginBottom: 20, borderBottom: 2, borderBottomColor: '#1a1a1a', paddingBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#666' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 8, backgroundColor: '#f0f0f0', padding: 6 },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 160, fontWeight: 'bold', color: '#444' },
  value: { flex: 1 },
  listItem: { marginBottom: 3, paddingLeft: 10 },
  subSection: { marginBottom: 8, paddingLeft: 10 },
  subTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#999' },
  pageNumber: { position: 'absolute', bottom: 15, right: 40, fontSize: 8, color: '#999' },
  badge: { fontSize: 9, backgroundColor: '#e0e0e0', padding: '2 6', borderRadius: 3, marginRight: 4, marginBottom: 2 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  separator: { borderBottom: 1, borderBottomColor: '#e0e0e0', marginVertical: 8 },
})

interface OSINTPDFReportProps {
  profile: CompleteOSINTProfile
  profileMeta?: {
    created_at?: string
    punteggio_complessivo?: number
    completezza_profilo?: number
  }
}

export function OSINTPDFReport({ profile, profileMeta }: OSINTPDFReportProps) {
  const target = profile.target
  const family = profile.family
  const career = profile.career
  const education = profile.education
  const lifestyle = profile.lifestyle
  const wealth = profile.wealth
  const socialGraph = profile.social_graph
  const authoritySignals = profile.authority_signals
  const workModel = profile.work_model
  const visionGoals = profile.vision_goals
  const needsMapping = profile.needs_mapping
  const engagement = profile.engagement

  const nomeCompleto = `${target?.nome || ''} ${target?.cognome || ''}`.trim()
  const dataGenerazione = new Date().toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Document>
      {/* PAGE 1 - Identity, Family, Career, Education */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Profilo OSINT - {nomeCompleto}</Text>
          <Text style={styles.subtitle}>
            Generato il {dataGenerazione} - LEO-FODI Confidenziale
          </Text>
          {profileMeta?.punteggio_complessivo != null && (
            <Text style={styles.subtitle}>
              Punteggio: {profileMeta.punteggio_complessivo}/100 | Completezza: {profileMeta.completezza_profilo || 0}%
            </Text>
          )}
        </View>

        {/* 1. Target Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Dati Target</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome:</Text>
            <Text style={styles.value}>{nomeCompleto}</Text>
          </View>
          {target?.citta && (
            <View style={styles.row}>
              <Text style={styles.label}>Citta:</Text>
              <Text style={styles.value}>{target.citta}</Text>
            </View>
          )}
          {target?.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{target.email}</Text>
            </View>
          )}
          {target?.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Telefono:</Text>
              <Text style={styles.value}>{target.phone}</Text>
            </View>
          )}
          {target?.linkedin_url && (
            <View style={styles.row}>
              <Text style={styles.label}>LinkedIn:</Text>
              <Text style={styles.value}>{target.linkedin_url}</Text>
            </View>
          )}
        </View>

        {/* 2. Family */}
        {family && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Nucleo Familiare (Confidence: {family.confidence_score}%)</Text>
            {family.nucleo_familiare_attuale?.coniuge && (
              <View style={styles.row}>
                <Text style={styles.label}>Coniuge:</Text>
                <Text style={styles.value}>{family.nucleo_familiare_attuale.coniuge.nome}</Text>
              </View>
            )}
            {family.nucleo_familiare_attuale?.figli && family.nucleo_familiare_attuale.figli.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subTitle}>Figli:</Text>
                {family.nucleo_familiare_attuale.figli.map((f, i) => (
                  <Text key={i} style={styles.listItem}>- {f.nome}{f.eta_stimata ? ` (eta stimata: ${f.eta_stimata})` : ''}</Text>
                ))}
              </View>
            )}
            {family.residenza && (
              <View style={styles.row}>
                <Text style={styles.label}>Residenza:</Text>
                <Text style={styles.value}>{family.residenza.citta}{family.residenza.quartiere ? `, ${family.residenza.quartiere}` : ''} ({family.residenza.tipo_zona})</Text>
              </View>
            )}
          </View>
        )}

        {/* 3. Career */}
        {career && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Professione e Carriera (Confidence: {career.confidence_score}%)</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Ruolo Attuale:</Text>
              <Text style={styles.value}>{career.professione_attuale.ruolo}</Text>
            </View>
            {career.professione_attuale.azienda && (
              <View style={styles.row}>
                <Text style={styles.label}>Azienda:</Text>
                <Text style={styles.value}>{career.professione_attuale.azienda}</Text>
              </View>
            )}
            {career.professione_attuale.settore && (
              <View style={styles.row}>
                <Text style={styles.label}>Settore:</Text>
                <Text style={styles.value}>{career.professione_attuale.settore}</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.label}>Livello:</Text>
              <Text style={styles.value}>{career.professione_attuale.livello}</Text>
            </View>
            {career.storico_professionale && career.storico_professionale.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subTitle}>Storico Professionale:</Text>
                {career.storico_professionale.slice(0, 5).map((s, i) => (
                  <Text key={i} style={styles.listItem}>- {s.ruolo}{s.azienda ? ` @ ${s.azienda}` : ''} ({s.periodo})</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 4. Education */}
        {education && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Formazione (Confidence: {education.confidence_score}%)</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Titolo Massimo:</Text>
              <Text style={styles.value}>{education.titolo_studio_massimo.livello}{education.titolo_studio_massimo.campo_studio ? ` - ${education.titolo_studio_massimo.campo_studio}` : ''}</Text>
            </View>
            {education.titolo_studio_massimo.istituzione && (
              <View style={styles.row}>
                <Text style={styles.label}>Istituzione:</Text>
                <Text style={styles.value}>{education.titolo_studio_massimo.istituzione}</Text>
              </View>
            )}
            {education.sintesi_percorso && (
              <View style={styles.row}>
                <Text style={styles.label}>Sintesi:</Text>
                <Text style={styles.value}>{education.sintesi_percorso}</Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.footer}>Documento confidenziale generato da LEO-FODI - Solo per uso interno Leonardo Assicurazioni</Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>

      {/* PAGE 2 - Lifestyle, Wealth, Social */}
      <Page size="A4" style={styles.page}>
        {/* 5. Lifestyle */}
        {lifestyle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Hobby e Interessi (Confidence: {lifestyle.confidence_score}%)</Text>
            {lifestyle.stile_vita && (
              <View style={styles.row}>
                <Text style={styles.label}>Stile di Vita:</Text>
                <Text style={styles.value}>{lifestyle.stile_vita.tipo} - {lifestyle.stile_vita.descrizione}</Text>
              </View>
            )}
            {lifestyle.interessi_principali && lifestyle.interessi_principali.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subTitle}>Interessi Principali:</Text>
                {lifestyle.interessi_principali.map((int, i) => (
                  <Text key={i} style={styles.listItem}>- {int}</Text>
                ))}
              </View>
            )}
            {lifestyle.viaggi && (
              <View style={styles.row}>
                <Text style={styles.label}>Viaggi:</Text>
                <Text style={styles.value}>Frequenza: {lifestyle.viaggi.frequenza}, Tipo: {lifestyle.viaggi.tipo_viaggio}</Text>
              </View>
            )}
          </View>
        )}

        {/* 6. Wealth */}
        {wealth && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Valutazione Economica (Confidence: {wealth.confidence_score}%)</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Fascia:</Text>
              <Text style={styles.value}>{wealth.valutazione_economica.fascia}</Text>
            </View>
            {wealth.valutazione_economica.reddito_stimato_annuo && (
              <View style={styles.row}>
                <Text style={styles.label}>Reddito Stimato:</Text>
                <Text style={styles.value}>{wealth.valutazione_economica.reddito_stimato_annuo.min.toLocaleString('it-IT')} - {wealth.valutazione_economica.reddito_stimato_annuo.max.toLocaleString('it-IT')} EUR/anno</Text>
              </View>
            )}
            {wealth.tenore_vita && (
              <View style={styles.row}>
                <Text style={styles.label}>Tenore di Vita:</Text>
                <Text style={styles.value}>{wealth.tenore_vita.descrizione}</Text>
              </View>
            )}
            {wealth.indicatori_ricchezza && wealth.indicatori_ricchezza.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subTitle}>Indicatori:</Text>
                {wealth.indicatori_ricchezza.slice(0, 5).map((ind, i) => (
                  <Text key={i} style={styles.listItem}>- [{ind.tipo}] {ind.descrizione} (peso: {ind.peso})</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 7. Social Graph */}
        {socialGraph && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Rete Sociale (Confidence: {socialGraph.confidence_score}%)</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Dimensione Rete:</Text>
              <Text style={styles.value}>{socialGraph.rete_sociale.dimensione}</Text>
            </View>
            {socialGraph.connessioni_chiave && socialGraph.connessioni_chiave.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subTitle}>Connessioni Chiave:</Text>
                {socialGraph.connessioni_chiave.slice(0, 5).map((c, i) => (
                  <Text key={i} style={styles.listItem}>- {c.nome} ({c.relazione}, influenza: {c.influenza})</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 8. Authority Signals */}
        {authoritySignals && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Segnali di Autorita (Confidence: {authoritySignals.confidence_score}%)</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Livello Influenza:</Text>
              <Text style={styles.value}>{authoritySignals.livello_influenza}</Text>
            </View>
            {authoritySignals.premi_certificazioni && authoritySignals.premi_certificazioni.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subTitle}>Premi e Certificazioni:</Text>
                {authoritySignals.premi_certificazioni.slice(0, 4).map((p, i) => (
                  <Text key={i} style={styles.listItem}>- {p.nome} ({p.organizzazione})</Text>
                ))}
              </View>
            )}
          </View>
        )}

        <Text style={styles.footer}>Documento confidenziale generato da LEO-FODI - Solo per uso interno Leonardo Assicurazioni</Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>

      {/* PAGE 3 - Work Model, Vision, Needs, Engagement, Executive Summary */}
      <Page size="A4" style={styles.page}>
        {/* 9. Work Model */}
        {workModel && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Modello Lavorativo (Confidence: {workModel.confidence_score}%)</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Modalita:</Text>
              <Text style={styles.value}>{workModel.modalita_lavoro.tipo} - {workModel.modalita_lavoro.descrizione}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Ambiente:</Text>
              <Text style={styles.value}>{workModel.ambiente_lavoro.tipo} (team: {workModel.ambiente_lavoro.team_size})</Text>
            </View>
          </View>
        )}

        {/* 10. Vision & Goals */}
        {visionGoals && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Visione e Obiettivi (Confidence: {visionGoals.confidence_score}%)</Text>
            {visionGoals.obiettivi_professionali && visionGoals.obiettivi_professionali.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subTitle}>Obiettivi Professionali:</Text>
                {visionGoals.obiettivi_professionali.map((o, i) => (
                  <Text key={i} style={styles.listItem}>- [{o.termine}] {o.obiettivo} (priorita: {o.priorita})</Text>
                ))}
              </View>
            )}
            {visionGoals.valori_fondamentali && visionGoals.valori_fondamentali.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subTitle}>Valori Fondamentali:</Text>
                {visionGoals.valori_fondamentali.map((v, i) => (
                  <Text key={i} style={styles.listItem}>- {v.valore}: {v.descrizione}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 11. Needs Mapping */}
        {needsMapping && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Mappatura Bisogni (Confidence: {needsMapping.confidence_score}%)</Text>
            {needsMapping.bisogni_identificati && needsMapping.bisogni_identificati.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subTitle}>Bisogni Identificati:</Text>
                {needsMapping.bisogni_identificati.map((b, i) => (
                  <Text key={i} style={styles.listItem}>- [{b.categoria}] {b.bisogno} (priorita: {b.priorita})</Text>
                ))}
              </View>
            )}
            {needsMapping.opportunita && needsMapping.opportunita.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subTitle}>Opportunita:</Text>
                {needsMapping.opportunita.map((o, i) => (
                  <Text key={i} style={styles.listItem}>- {o.descrizione} (potenziale: {o.potenziale})</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 12. Engagement */}
        {engagement && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Leve di Ingaggio (Confidence: {engagement.confidence_score}%)</Text>
            {engagement.leve_principali && engagement.leve_principali.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subTitle}>Leve Principali:</Text>
                {engagement.leve_principali.map((l, i) => (
                  <Text key={i} style={styles.listItem}>- [{l.categoria}] {l.leva} (efficacia: {l.efficacia})</Text>
                ))}
              </View>
            )}
            {engagement.canali_comunicazione && engagement.canali_comunicazione.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subTitle}>Canali Comunicazione:</Text>
                {engagement.canali_comunicazione.map((c, i) => (
                  <Text key={i} style={styles.listItem}>- {c.canale}: efficacia {c.efficacia}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Executive Summary */}
        {profile.sintesi_esecutiva && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sintesi Esecutiva</Text>
            <Text style={{ fontSize: 10, lineHeight: 1.5 }}>{profile.sintesi_esecutiva}</Text>
          </View>
        )}

        <Text style={styles.footer}>Documento confidenziale generato da LEO-FODI - Solo per uso interno Leonardo Assicurazioni</Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  )
}
