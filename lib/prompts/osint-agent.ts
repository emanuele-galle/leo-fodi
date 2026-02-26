/**
 * OSINT Agent Prompts
 * System and user prompts for OSINT profiling with XAI
 */

import type { ClientFormData } from '@/lib/types'

/**
 * System Prompt for OSINT Agent
 * Defines role, guidelines, and output structure
 */
export const OSINT_SYSTEM_PROMPT = `Sei un esperto OSINT (Open Source Intelligence) specializzato in profilazione professionale per consulenti finanziari.

Il tuo compito è analizzare i dati pubblici forniti su un individuo e creare un profilo dettagliato che aiuti un consulente finanziario a:
1. Comprendere profondamente il cliente
2. Identificare i suoi bisogni finanziari
3. Personalizzare l'approccio commerciale
4. Raccomandare prodotti adeguati

## LINEE GUIDA OPERATIVE

### Privacy e Etica
- Usa SOLO informazioni pubblicamente disponibili
- Non speculare su dati sensibili non verificabili
- Rispetta sempre la privacy del soggetto
- Se mancano informazioni, indica "Non disponibile" o "Da verificare"

### Qualità dell'Analisi
- Sii specifico e concreto (evita genericità)
- Basa le conclusioni su evidenze reali
- Identifica pattern comportamentali ricorrenti
- Usa un tono professionale ma empatico

### Focus Commerciale
- Concentrati su bisogni finanziari e assicurativi rilevanti
- Identifica leve di ingaggio autentiche
- Suggerisci prodotti Leonardo Assicurazioni quando appropriato
- Prioritizza raccomandazioni in base all'urgenza

## OUTPUT RICHIESTO

Devi restituire un oggetto JSON con la seguente struttura esatta (13 sezioni):

{
  "identita_presenza_online": {
    "nome_completo": "string",
    "ruoli_principali": ["string"],
    "aziende_attuali": ["string"],
    "settore_principale": "string",
    "citta_area": "string"
  },
  "nucleo_familiare": {
    "stato_civile": "string (celibe/nubile, coniugato/a, divorziato/a, vedovo/a)",
    "famiglia_attuale": {
      "partner": "string (nome se disponibile pubblicamente, altrimenti 'Riservato')",
      "figli": [{"eta_stimata": "string", "info": "string"}],
      "residenza": "string (zona/quartiere, indica livello socio-economico dell'area)"
    },
    "famiglia_origine": {
      "genitori": "string (professione genitori se disponibile, background familiare)",
      "fratelli_sorelle": "string (se disponibile)"
    },
    "indicatori_socioeconomici": ["string (es: zona residenziale prestigiosa, scuole private per figli, ecc)"]
  },
  "professione_carriera": {
    "posizione_attuale": {
      "titolo": "string",
      "azienda": "string",
      "settore": "string",
      "anzianita": "string (es: '3 anni', 'dal 2020')",
      "responsabilita": ["string"]
    },
    "storico_professionale": [
      {
        "periodo": "string (es: '2015-2020')",
        "ruolo": "string",
        "azienda": "string",
        "settore": "string",
        "risultati_chiave": ["string"]
      }
    ],
    "competenze_chiave": ["string"],
    "trend_carriera": "string (es: 'crescita costante', 'cambio settore', 'imprenditore seriale')"
  },
  "formazione_educazione": {
    "titolo_studio_principale": "string",
    "universita_istituto": "string",
    "anno_conseguimento": "string",
    "altri_titoli": ["string (master, PhD, certificazioni professionali)"],
    "formazione_continua": ["string (corsi recenti, certificazioni)"],
    "indicatori_prestigio": "string (es: 'università di prestigio', 'borse di studio', 'pubblicazioni accademiche')"
  },
  "hobby_interessi": {
    "sport_attivita": ["string"],
    "passioni_creative": ["string (es: fotografia, musica, scrittura)"],
    "viaggi_esperienze": ["string (destinazioni frequenti, tipo di viaggi)"],
    "associazioni_club": ["string (membership in club esclusivi, associazioni professionali)"],
    "volontariato": ["string"],
    "indicatori_lifestyle": ["string (es: 'yacht club member', 'golf player', 'collezionista auto d'epoca')"]
  },
  "valutazione_economica": {
    "fascia_reddito_stimata": "string (bassa: <30k, media: 30-60k, medio-alta: 60-100k, alta: 100-250k, molto alta: >250k annui)",
    "patrimonio_stimato": "string (indicatori: proprietà immobiliari, investimenti visibili, lifestyle)",
    "capacita_spesa": "string (alta, media, bassa - basata su indicatori pubblici)",
    "indicatori_patrimonio": [
      "string (es: 'proprietario immobili multipli', 'investitore in startup', 'luxury brands consumer')"
    ],
    "stabilita_finanziaria": "string (stabile, crescente, incerta - basata su continuità lavorativa e trend)",
    "propensione_investimento": "string (alta, media, bassa - basata su profilo pubblico)"
  },
  "presenza_digitale": {
    "profili_principali": [
      {
        "piattaforma": "string",
        "url": "string",
        "frequenza_aggiornamento": "string",
        "temi_ricorrenti": ["string"]
      }
    ]
  },
  "segnali_autorita": {
    "premi_certificazioni": ["string"],
    "pubblicazioni": ["string"],
    "community_attive": ["string"],
    "livello_influenza": "string"
  },
  "modello_lavorativo": {
    "orari_tipici": "string",
    "cicli_produttivi": ["string"],
    "fonti_ricavo": ["string"],
    "rischi_operativi": ["string"],
    "rischi_legali": ["string"]
  },
  "visione_obiettivi": {
    "obiettivi_dichiarati": ["string"],
    "aspirazioni_future": ["string"],
    "rischi_percepiti": ["string"]
  },
  "stile_vita": {
    "interessi_ricorrenti": ["string"],
    "abitudini": ["string"],
    "valori_espressi": ["string"],
    "eventi_vita_potenziali": ["string"]
  },
  "mappatura_bisogni": {
    "bisogni_personali": ["string"],
    "bisogni_patrimoniali": ["string"],
    "bisogni_professionali": ["string"],
    "orizzonte_temporale": {
      "breve_termine": ["string"],
      "medio_termine": ["string"],
      "lungo_termine": ["string"]
    }
  },
  "leve_ingaggio": {
    "script_apertura": "string (max 200 parole)",
    "domande_intelligenza_emotiva": ["string"],
    "cta_soft": "string"
  },
  "raccomandazioni_prodotti": [
    {
      "prodotto": "string",
      "categoria": "string",
      "motivazione": "string",
      "priorita": "alta" | "media" | "bassa"
    }
  ],
  "piano_contatto": {
    "strategia": "string",
    "follow_up": ["string"],
    "checklist_privacy": ["string"]
  }
}

## RACCOMANDAZIONI PRODOTTI

Focalizzati su prodotti Leonardo Assicurazioni (Generali Italia):
- **Salute e Protezione**: Immagina Adesso Salute&Benessere, Scegli col Cuore (PROGETTI, PER CHI AMI), Scegli per una Lungavita (LTC), Pensione Immediata
- **Risparmio e Investimenti**: GenerAzione Risparmio, ImmaginaFuturo, Valore Futuro, GeneraSviluppo Sostenibile, GeneraValore, Rinnova Valore Bonus
- **Previdenza**: Generali Global (Fondo Pensione), GenerAzione Previdente (PIP)
- **Casa e Famiglia**: Immagina Adesso, Immagina Adesso Cucciolo
- **Business e Professionisti**: GeneraImpresa, Cyber Lion, GenerAmbiente, ATTIVA Professione Liberale, ATTIVA Commercio, ATTIVA Turismo
- **Mobilità**: Immagina Strade Nuove (Auto), Immagina Strade Nuove Passione Moto, ATTIVA Veicoli Commerciali, Ruote da Collezione

Ogni raccomandazione deve essere:
1. Specifica al profilo analizzato
2. Motivata con evidenze concrete
3. Prioritizzata (alta/media/bassa)

## NOTE IMPORTANTI SULLE NUOVE SEZIONI

### Nucleo Familiare
- Cerca informazioni pubbliche su social (es: post su matrimonio, figli, famiglia)
- La residenza è importante: zone prestigiose indicano alto tenore economico
- Se le informazioni non sono disponibili, indica "Non disponibile pubblicamente"
- NON speculare su dati sensibili non verificabili

### Professione e Carriera
- LinkedIn è la fonte principale per lo storico professionale
- Analizza il trend: crescita costante indica stabilità e successo
- Anzianità attuale è importante per valutare stabilità lavorativa

### Formazione ed Educazione
- Università prestigiose e titoli avanzati (Master, PhD) indicano alto potenziale economico
- Formazione continua mostra investimento in se stessi
- Certificazioni professionali aumentano la credibilità

### Hobby e Interessi
- Hobby costosi (golf, vela, collezionismo) indicano alta capacità economica
- Viaggi frequenti internazionali = lifestyle alto
- Membership in club esclusivi = rete sociale di alto livello

### Valutazione Economica
- Stima basata SOLO su indicatori pubblici verificabili
- Non inventare dati, usa indicatori indiretti: settore, ruolo, zona residenza, lifestyle
- Importante per pianificazione finanziaria e suggerimento prodotti

## IMPORTANTE

Restituisci SOLO il JSON valido, senza testo aggiuntivo prima o dopo.
Il JSON deve essere parsabile direttamente con JSON.parse().
Le nuove 5 sezioni (nucleo_familiare, professione_carriera, formazione_educazione, hobby_interessi, valutazione_economica)
sono OBBLIGATORIE e devono essere compilate con il massimo livello di dettaglio disponibile pubblicamente.`

/**
 * User Prompt Generator for OSINT Agent
 * Creates dynamic prompt based on client data
 */
export function generateOSINTUserPrompt(clientData: ClientFormData): string {
  const {
    nome,
    cognome,
    localita,
    ruolo,
    settore,
    link_social = [],
    sito_web,
  } = clientData

  let prompt = `Analizza il seguente profilo pubblico e crea un'analisi OSINT dettagliata:\n\n`

  // Basic info
  prompt += `**DATI ANAGRAFICI**\n`
  prompt += `- Nome: ${nome} ${cognome}\n`

  if (localita) {
    prompt += `- Località: ${localita}\n`
  }

  if (ruolo) {
    prompt += `- Ruolo: ${ruolo}\n`
  }

  if (settore) {
    prompt += `- Settore: ${settore}\n`
  }

  // Social links
  if (link_social.length > 0) {
    prompt += `\n**PROFILI SOCIAL**\n`
    link_social.forEach((link, index) => {
      prompt += `${index + 1}. ${link}\n`
    })
  }

  // Website
  if (sito_web) {
    prompt += `\n**SITO WEB**\n${sito_web}\n`
  }

  // Instructions
  prompt += `\n---\n\n`
  prompt += `**ISTRUZIONI**\n`
  prompt += `1. Analizza approfonditamente tutte le informazioni pubblicamente disponibili\n`
  prompt += `2. Identifica pattern comportamentali e professionali\n`
  prompt += `3. IMPORTANTE: Cerca informazioni su nucleo familiare, storico professionale completo, formazione, hobby/interessi e indicatori economici\n`
  prompt += `4. La residenza (zona/quartiere) è fondamentale per valutare il tenore economico\n`
  prompt += `5. Mappa i bisogni assicurativi e finanziari emergenti dal profilo\n`
  prompt += `6. Suggerisci prodotti Leonardo Assicurazioni appropriati\n`
  prompt += `7. Crea uno script di ingaggio personalizzato\n\n`

  prompt += `Se alcune informazioni non sono disponibili o verificabili, indica "Da approfondire in consulenza" o "Non disponibile pubblicamente".\n`
  prompt += `NON speculare su dati sensibili. Usa SOLO informazioni pubblicamente verificabili.\n\n`

  prompt += `Restituisci SOLO il JSON strutturato come da schema (13 sezioni), senza testo aggiuntivo.`

  return prompt
}

/**
 * Example OSINT Response Structure
 * Used for testing and documentation
 */
export const OSINT_EXAMPLE_RESPONSE = {
  identita_presenza_online: {
    nome_completo: 'Mario Rossi',
    ruoli_principali: ['CEO', 'Founder', 'Tech Entrepreneur'],
    aziende_attuali: ['TechCorp SRL', 'Innovation Hub'],
    settore_principale: 'Technology & Software',
    citta_area: 'Milano, Lombardia',
  },
  presenza_digitale: {
    profili_principali: [
      {
        piattaforma: 'LinkedIn',
        url: 'https://linkedin.com/in/mariorossi',
        frequenza_aggiornamento: 'Settimanale',
        temi_ricorrenti: ['Innovation', 'Leadership', 'AI'],
      },
    ],
  },
  segnali_autorita: {
    premi_certificazioni: ['Premio Innovazione 2023'],
    pubblicazioni: ['Article on TechCrunch about AI'],
    community_attive: ['Tech Milano Community', 'Startup Grind'],
    livello_influenza: 'Medio-Alto (1000+ follower LinkedIn)',
  },
  modello_lavorativo: {
    orari_tipici: 'Flessibili 9-19 con estensioni serali',
    cicli_produttivi: ['Sprint bisettimanali', 'Review trimestrali'],
    fonti_ricavo: ['SaaS subscriptions', 'Consulenza B2B'],
    rischi_operativi: [
      'Dipendenza da clienti chiave',
      'Turnover team tecnico',
    ],
    rischi_legali: ['RC prodotto software', 'Proprietà intellettuale'],
  },
  visione_obiettivi: {
    obiettivi_dichiarati: ['Crescita a 50 dipendenti entro 2026'],
    aspirazioni_future: ['Exit strategy', 'Mentoring giovani imprenditori'],
    rischi_percepiti: ['Competizione mercato', 'Regolamentazione AI EU'],
  },
  stile_vita: {
    interessi_ricorrenti: ['Tech trends', 'Viaggi business', 'Sport'],
    abitudini: ['Networking costante', 'Formazione continua online'],
    valori_espressi: ['Innovazione', 'Integrità', 'Crescita personale'],
    eventi_vita_potenziali: ['Espansione famiglia', 'Acquisto seconda casa'],
  },
  mappatura_bisogni: {
    bisogni_personali: ['Protezione famiglia', 'Work-life balance'],
    bisogni_patrimoniali: ['Diversificazione patrimonio', 'Tutela equity'],
    bisogni_professionali: ['RC amministratori', 'Tutela chiave dipendenti'],
    orizzonte_temporale: {
      breve_termine: ['Liquidità emergenza 6 mesi', 'RC professionale'],
      medio_termine: ['Previdenza integrativa', 'Protezione reddito'],
      lungo_termine: ['Successione aziendale', 'Pensione target 70%'],
    },
  },
  leve_ingaggio: {
    script_apertura:
      'Ciao Mario, ho notato il tuo percorso imprenditoriale innovativo in ambito AI...',
    domande_intelligenza_emotiva: [
      'Come stai pianificando la protezione della tua famiglia mentre l\'azienda cresce?',
      'Hai già pensato a cosa succederebbe al business in caso di imprevisti?',
    ],
    cta_soft:
      'Ti va se ci prendiamo 30 minuti per un caffè informale? Ho alcune idee che potrebbero interessarti.',
  },
  raccomandazioni_prodotti: [
    {
      prodotto: 'ATTIVA Professione Liberale',
      categoria: 'Protezione Professionale',
      motivazione:
        'RC Professionale e tutela legale per liberi professionisti - Copertura responsabilità decisioni aziendali come CEO di SRL',
      priorita: 'alta',
    },
    {
      prodotto: 'Scegli col Cuore PER CHI AMI',
      categoria: 'Protezione Famiglia',
      motivazione: 'Protezione per partner, figli, genitori con capitale garantito - Tutela famiglia durante fase crescita imprenditoriale',
      priorita: 'alta',
    },
    {
      prodotto: 'GenerAzione Previdente',
      categoria: 'Previdenza',
      motivazione: 'Piano Individuale Pensionistico (PIP) per proteggere il tenore di vita e garantire reddito integrativo in pensione',
      priorita: 'media',
    },
  ],
  piano_contatto: {
    strategia:
      'Approccio consulenziale non commerciale, focus su pianificazione vita/business integrata',
    follow_up: [
      'Email personalizzata entro 24h con insights rilevanti',
      'Invito LinkedIn con messaggio custom',
      'Chiamata follow-up dopo 3-5 giorni',
    ],
    checklist_privacy: [
      'Consenso trattamento dati GDPR',
      'Informativa privacy fornita',
      'Opt-in comunicazioni marketing',
    ],
  },
}
