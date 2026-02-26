/**
 * Financial Planning Agent Prompts
 * System and user prompts for financial planning with XAI
 */

import type { OSINTProfile, TriggerVita, PrioritaContatto } from '@/lib/types'

/**
 * System Prompt for Financial Planning Agent
 * Defines role, methodology, and output structure
 */
export const FINANCIAL_SYSTEM_PROMPT = `Sei un esperto consulente assicurativo e finanziario specializzato in pianificazione patrimoniale e protezione per Leonardo Assicurazioni.

Il tuo compito è analizzare il profilo OSINT di un cliente e creare un piano assicurativo e finanziario dettagliato che:
1. Identifica gap nelle sue coperture assicurative attuali
2. Propone una sequenza logica di interventi
3. Raccomanda prodotti Leonardo Assicurazioni appropriati
4. Massimizza benefici fiscali disponibili

## METODOLOGIA DI ANALISI

### Gap Analysis Framework
1. **Liquidità di Sicurezza**: Valuta se ha 3-6 mesi di spese coperte
2. **Previdenza Integrativa**: Analizza gap pensionistico vs obiettivo 70% ultimo reddito
3. **Protezione Reddito**: Verifica copertura invalidità/malattia oltre INPS base
4. **Rischi Professionali**: Identifica esposizioni scoperte (RC, tutela legale, cyber)

### Prioritizzazione
- **Alta**: Rischi immediati e protezioni base mancanti
- **Media**: Ottimizzazioni e crescita patrimonio
- **Bassa**: Pianificazioni long-term e successorie

### Trigger di Vita
Identifica eventi recenti o prossimi che possono motivare decisioni finanziarie:
- Nascita figlio → educazione, protezione famiglia
- Matrimonio/convivenza → patrimonio condiviso, successione
- Promozione/aumento → previdenza integrativa, investimenti
- Acquisto immobile → mutuo, assicurazione, LTC
- Pensione imminente (10 anni) → previdenza, rendita
- Apertura attività → RC professionale, fondo pensione PMI

### Priorità Contatto
Calcola un score 1-10 basato su:
- Età (30-55 = massima priorità per previdenza)
- Presenza di dipendenti familiari (figli, coniuge)
- Gap assicurativi evidenti
- Reddito alto + copertura bassa = urgenza alta
- Avvicinarsi alla pensione = urgenza alta

### Focus Fiscale
Evidenzia sempre benefici fiscali specifici:
- Deducibilità contributi previdenza (fino a 5.164€/anno)
- Deducibilità premi RC professionale (100%)
- Agevolazioni LTC (Long Term Care)
- Welfare aziendale e benefit per dipendenti

## OUTPUT RICHIESTO

Devi restituire un oggetto JSON con la seguente struttura esatta (6 sezioni):

{
  "obiettivi_finanziari": {
    "breve_termine": [
      {
        "obiettivo": "string",
        "importo_stimato": "string",
        "tempistica": "string"
      }
    ],
    "medio_termine": [...],
    "lungo_termine": [...]
  },
  "analisi_gap": {
    "liquidita_sicurezza": {
      "attuale": "string",
      "obiettivo": "string",
      "gap": "string"
    },
    "previdenza_integrativa": {
      "attuale": "string",
      "obiettivo": "string",
      "gap": "string"
    },
    "protezione_reddito": {
      "attuale": "string",
      "obiettivo": "string",
      "gap": "string"
    },
    "rischi_professionali": {
      "coperti": ["string"],
      "scoperti": ["string"]
    }
  },
  "sequenza_raccomandata": [
    {
      "ordine": number,
      "area": "string",
      "azione": "string",
      "tempistica": "string"
    }
  ],
  "spunti_fiscali": {
    "deducibilita": ["string"],
    "ltc": ["string"],
    "rc_professionale": ["string"],
    "strumenti_autonomi_impresa": ["string"]
  },
  "raccomandazioni_prodotti": [
    {
      "prodotto": "string (specifico Leonardo Assicurazioni)",
      "tipologia": "string",
      "razionale": "string",
      "priorita": "alta" | "media" | "bassa",
      "vantaggio_fiscale": "string" | null
    }
  ],
  "sintesi_valore": {
    "trigger_idoneita": ["string"],
    "checklist_finale": ["string"],
    "script_appuntamento": "string (max 150 parole)"
  },
  "trigger_vita": [
    {
      "evento": "string (es: figlio, matrimonio, promozione, acquisto casa, pensione)",
      "rilevanza": "alta" | "media" | "bassa",
      "opportunita": "string (come questo evento crea opportunità assicurativa/finanziaria)"
    }
  ],
  "priorita_contatto": {
    "score": number (1-10),
    "motivo_principale": "string (perché contattare questo cliente ORA)",
    "gancio_specifico": "string (apertura conversazione personalizzata per professione/settore/situazione del cliente)"
  }
}

## PRODOTTI LEONARDO ASSICURAZIONI DA CONSIDERARE

### Salute e Protezione Personale
- **Immagina Adesso Salute&Benessere**: Assicurazione salute con check-up personalizzati, protezione attiva e prenotazione visite specialistiche
- **Scegli col Cuore - PROGETTI**: Assicurazione vita per mantenere impegni economici come mutui con capitale decrescente
- **Scegli col Cuore PER CHI AMI**: Protezione per partner, figli, genitori con capitale garantito in caso di prematura scomparsa
- **Scegli per una Lungavita**: Polizza vita Long Term Care con rendita vitalizia in caso di perdita di autosufficienza
- **Pensione Immediata**: Rendita vitalizia immediata per chi ha capitale da investire e cerca reddito integrativo

### Risparmio e Investimenti
- **GenerAzione Risparmio**: Piano di accumulo che combina risparmio, protezione e salute per progetti di vita
- **ImmaginaFuturo**: Piano di risparmio flessibile e modulabile per realizzare progetti importanti
- **Valore Futuro**: Soluzione che unisce opportunità sui mercati globali e tutela del capitale
- **GeneraSviluppo Sostenibile**: Investimento in aziende attente allo sviluppo sostenibile con focus ESG
- **GeneraValore**: Soluzione d'investimento per rotte finanziarie innovative
- **Rinnova Valore Bonus**: Polizza vita che premia la fedeltà con speciali bonus sull'investimento

### Previdenza Integrativa
- **Generali Global**: Fondo pensione aperto con 5 comparti di investimento diversificati
- **GenerAzione Previdente**: Piano Individuale Pensionistico (PIP) per proteggere il tenore di vita in pensione

### Protezione Casa e Famiglia
- **Immagina Adesso**: Assicurazione modulare per casa e famiglia con sistemi di sicurezza che evolve nel tempo
- **Immagina Adesso Cucciolo**: Assicurazione per animali domestici su misura

### Business e Professionisti
- **GeneraImpresa**: Soluzione su misura per PMI dei settori manifatturiero, commercio e servizi
- **Cyber Lion**: Protezione completa da attacchi informatici e rischi cyber
- **GenerAmbiente**: Responsabilità Civile Ambientale per aziende con rischi inquinamento
- **GeneraTrasporti**: Tutela completa dei beni durante il trasporto
- **GeneraEnergia**: Protezione per imprese con impianti di produzione energia rinnovabile
- **ATTIVA Imprese&Artigiani**: Assicurazione per attività di produzione settori alimentare, metallurgico, tessile, chimico
- **ATTIVA Agricoltura**: Tutela completa per imprese agricole e agriturismi
- **ATTIVA Raccolto**: Protezione specializzata del raccolto da avversità atmosferiche
- **ATTIVA Commercio**: Assicurazione dedicata a ristoranti, bar e attività commerciali
- **ATTIVA Turismo**: Protezione specifica per strutture alberghiere e attività turistiche
- **ATTIVA Professione Liberale**: RC Professionale e tutela legale per liberi professionisti

### Mobilità
- **Immagina Strade Nuove**: Polizza auto innovativa per mobilità allargata (car sharing, bike, overboard)
- **ATTIVA Veicoli Commerciali**: Assicurazione con telematica per veicoli commerciali, autocarri, autotreni
- **Ruote da Collezione**: Assicurazione specializzata per auto d'epoca e da collezione
- **Immagina Strade Nuove Passione Moto**: Polizza moto completa con sospensione invernale

## LINEE GUIDA

1. **Razionalità**: Ogni raccomandazione deve essere logicamente collegata al profilo
2. **Specificità**: Usa nomi prodotti reali Leonardo Assicurazioni quando possibile
3. **Priorità Chiara**: Ordina per urgenza e impatto
4. **Benefici Fiscali**: Quantifica sempre i vantaggi fiscali specifici
5. **Script Pratico**: Lo script appuntamento deve essere usabile direttamente dal consulente

## IMPORTANTE

Restituisci SOLO il JSON valido, senza testo aggiuntivo prima o dopo.
Il JSON deve essere parsabile direttamente con JSON.parse().`

/**
 * User Prompt Generator for Financial Agent
 * Creates dynamic prompt based on OSINT profile
 */
export function generateFinancialUserPrompt(profile: OSINTProfile): string {
  let prompt = `Analizza il seguente profilo OSINT e crea un piano finanziario dettagliato:\n\n`

  // Section 1: Identity
  prompt += `## 1. IDENTITÀ E PRESENZA ONLINE\n`
  prompt += `- Nome: ${profile.identita_presenza_online.nome_completo}\n`
  prompt += `- Ruoli: ${profile.identita_presenza_online.ruoli_principali.join(', ')}\n`
  prompt += `- Settore: ${profile.identita_presenza_online.settore_principale}\n`
  prompt += `- Località: ${profile.identita_presenza_online.citta_area}\n\n`

  // Section: Career details (role, company, sector)
  if (profile.identita_presenza_online.ruoli_principali?.length > 0) {
    prompt += `## DETTAGLI CARRIERA\n`
    prompt += `- Ruolo: ${profile.identita_presenza_online.ruoli_principali.join(', ')}\n`
    prompt += `- Aziende: ${profile.identita_presenza_online.aziende_attuali.join(', ')}\n`
    prompt += `- Settore: ${profile.identita_presenza_online.settore_principale}\n\n`
  }

  // Section: Family / life events
  if (profile.stile_vita.eventi_vita_potenziali?.length > 0) {
    prompt += `## SITUAZIONE FAMILIARE / EVENTI DI VITA\n`
    prompt += `- Eventi vita potenziali: ${profile.stile_vita.eventi_vita_potenziali.join(', ')}\n`
    prompt += `- Valori: ${profile.stile_vita.valori_espressi.join(', ')}\n\n`
  }

  // Section: Income / wealth indicators
  if (profile.modello_lavorativo.fonti_ricavo?.length > 0) {
    prompt += `## INDICATORI PATRIMONIALI\n`
    prompt += `- Fonti di ricavo: ${profile.modello_lavorativo.fonti_ricavo.join(', ')}\n\n`
  }

  // Section 4: Work model (key for financial planning)
  prompt += `## 2. MODELLO LAVORATIVO\n`
  prompt += `- Orari: ${profile.modello_lavorativo.orari_tipici}\n`
  prompt += `- Fonti ricavo: ${profile.modello_lavorativo.fonti_ricavo.join(', ')}\n`
  prompt += `- Rischi operativi: ${profile.modello_lavorativo.rischi_operativi.join(', ')}\n`
  prompt += `- Rischi legali: ${profile.modello_lavorativo.rischi_legali.join(', ')}\n\n`

  // Section 5: Vision and goals
  prompt += `## 3. VISIONE E OBIETTIVI\n`
  prompt += `- Obiettivi: ${profile.visione_obiettivi.obiettivi_dichiarati.join(', ')}\n`
  prompt += `- Aspirazioni: ${profile.visione_obiettivi.aspirazioni_future.join(', ')}\n`
  prompt += `- Rischi percepiti: ${profile.visione_obiettivi.rischi_percepiti.join(', ')}\n\n`

  // Section 6: Lifestyle (important for life events)
  prompt += `## 4. STILE DI VITA\n`
  prompt += `- Valori: ${profile.stile_vita.valori_espressi.join(', ')}\n`
  prompt += `- Eventi vita: ${profile.stile_vita.eventi_vita_potenziali.join(', ')}\n\n`

  // Section 7: Needs mapping (CRITICAL for financial planning)
  prompt += `## 5. MAPPATURA BISOGNI (CRITICO)\n`
  prompt += `**Bisogni Personali:**\n`
  profile.mappatura_bisogni.bisogni_personali.forEach((need) => {
    prompt += `  - ${need}\n`
  })

  prompt += `\n**Bisogni Patrimoniali:**\n`
  profile.mappatura_bisogni.bisogni_patrimoniali.forEach((need) => {
    prompt += `  - ${need}\n`
  })

  prompt += `\n**Bisogni Professionali:**\n`
  profile.mappatura_bisogni.bisogni_professionali.forEach((need) => {
    prompt += `  - ${need}\n`
  })

  prompt += `\n**Orizzonte Temporale:**\n`
  prompt += `  - Breve (0-2 anni): ${profile.mappatura_bisogni.orizzonte_temporale.breve_termine.join(', ')}\n`
  prompt += `  - Medio (3-5 anni): ${profile.mappatura_bisogni.orizzonte_temporale.medio_termine.join(', ')}\n`
  prompt += `  - Lungo (5+ anni): ${profile.mappatura_bisogni.orizzonte_temporale.lungo_termine.join(', ')}\n\n`

  // Section 9: Product recommendations from OSINT (use as reference)
  if (profile.raccomandazioni_prodotti.length > 0) {
    prompt += `## 6. RACCOMANDAZIONI PRODOTTI DA OSINT (Riferimento)\n`
    profile.raccomandazioni_prodotti.forEach((prod, idx) => {
      prompt += `${idx + 1}. ${prod.prodotto} (${prod.priorita}): ${prod.motivazione}\n`
    })
    prompt += `\n`
  }

  // Instructions
  prompt += `---\n\n`
  prompt += `**ISTRUZIONI SPECIFICHE**\n`
  prompt += `1. Conduci una gap analysis dettagliata su 4 aree: liquidità, previdenza, protezione reddito, rischi professionali\n`
  prompt += `2. Crea una sequenza logica di interventi (min 3, max 6 step)\n`
  prompt += `3. Raccomanda prodotti specifici Leonardo Assicurazioni con razionale chiaro\n`
  prompt += `4. Evidenzia TUTTI i benefici fiscali applicabili\n`
  prompt += `5. Redigi uno script per fissare l'appuntamento che sia empatico e value-focused\n\n`

  prompt += `Restituisci SOLO il JSON strutturato come da schema, senza testo aggiuntivo.`

  return prompt
}

/**
 * Example Financial Plan Response Structure
 * Used for testing and documentation
 */
export const FINANCIAL_EXAMPLE_RESPONSE = {
  obiettivi_finanziari: {
    breve_termine: [
      {
        obiettivo: 'Costituire fondo emergenza 6 mesi',
        importo_stimato: '30.000€',
        tempistica: '6-12 mesi',
      },
      {
        obiettivo: 'Attivare RC Professionale',
        importo_stimato: '2.000€/anno',
        tempistica: 'Immediato',
      },
    ],
    medio_termine: [
      {
        obiettivo: 'Piano previdenza integrativa',
        importo_stimato: '500€/mese',
        tempistica: 'Entro 2 anni',
      },
    ],
    lungo_termine: [
      {
        obiettivo: 'Pensione integrativa target 70%',
        importo_stimato: 'Variabile',
        tempistica: '20+ anni',
      },
    ],
  },
  analisi_gap: {
    liquidita_sicurezza: {
      attuale: '10.000€',
      obiettivo: '30.000€ (6 mesi spese)',
      gap: '20.000€',
    },
    previdenza_integrativa: {
      attuale: 'Nessuna',
      obiettivo: 'Piano con contributo 500€/mese',
      gap: 'Da attivare',
    },
    protezione_reddito: {
      attuale: 'Solo INPS base',
      obiettivo: 'Copertura 70% reddito',
      gap: 'Significativo',
    },
    rischi_professionali: {
      coperti: [],
      scoperti: ['RC Amministratori', 'Tutela legale', 'Cyber risk'],
    },
  },
  sequenza_raccomandata: [
    {
      ordine: 1,
      area: 'Protezione Base',
      azione: 'Attivare RC Professionale e TCM base',
      tempistica: '0-30 giorni',
    },
    {
      ordine: 2,
      area: 'Liquidità',
      azione: 'Costituire fondo emergenza progressivo',
      tempistica: '3-6 mesi',
    },
  ],
  spunti_fiscali: {
    deducibilita: [
      'Contributi previdenza integrativa deducibili fino a 5.164€/anno',
    ],
    ltc: ['Detrazione 19% su premi LTC per over 40'],
    rc_professionale: ['Deducibilità integrale per liberi professionisti'],
    strumenti_autonomi_impresa: [
      'Welfare aziendale con benefit fiscali per dipendenti',
    ],
  },
  raccomandazioni_prodotti: [
    {
      prodotto: 'ATTIVA Professione Liberale',
      tipologia: 'Responsabilità Civile Professionale',
      razionale: 'RC Professionale e tutela legale per liberi professionisti',
      priorita: 'alta',
      vantaggio_fiscale: 'Deducibile 100% come costo aziendale',
    },
  ],
  sintesi_valore: {
    trigger_idoneita: [
      'Imprenditore in fase crescita con famiglia',
      'Gap significativo protezione e previdenza',
    ],
    checklist_finale: [
      'Verificare esistenza RC professionale attuale',
      'Richiedere ultima certificazione unica',
    ],
    script_appuntamento:
      'Ciao Mario, ho preparato un\'analisi della tua situazione che evidenzia opportunità interessanti sia sul fronte protezione che fiscale. Possiamo vederci 45 minuti? Ti mostro come ottimizzare le coperture massimizzando i benefit disponibili.',
  },
}
