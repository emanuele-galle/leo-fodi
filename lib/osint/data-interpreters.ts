/**
 * Data Interpreters - Sistema di traduzione dati tecnici in informazioni comprensibili
 *
 * Obiettivo: Trasformare enum, valori grezzi e score in spiegazioni contestuali
 * per utenti non tecnici (commerciali assicurativi, manager, etc.)
 */

// ==================== TYPES ====================

export interface Interpretation {
  label: string
  description: string
  insurance_relevance?: string
  action_suggestion?: string
  color?: string
  icon?: string
}

export interface ConfidenceQuality {
  level: string
  color: string
  icon: string
  meaning: string
  reliability: string
  actions: string
}

export interface SocialPresenceInsight {
  category: string
  meaning: string
  insurance_relevance: string
  engagement_strategy: string
}

export interface WealthInterpretation {
  label: string
  range: string
  description: string
  products: string
  tax_considerations: string
}

// ==================== CAREER INTERPRETERS ====================

export function interpretCareerLevel(level: string): Interpretation {
  const interpretations: Record<string, Interpretation> = {
    entry: {
      label: "Livello Base",
      description: "0-2 anni di esperienza. Professionista all'inizio della carriera, in fase di apprendimento e crescita",
      insurance_relevance: "Bisogni: protezione reddito base, accumulo risparmio iniziale, coperture temporanee caso morte",
      action_suggestion: "Focus su prodotti semplici e flessibili, educazione finanziaria",
      color: "#10b981",
      icon: "🌱"
    },
    junior: {
      label: "Junior",
      description: "2-4 anni di esperienza. Crescita professionale in corso, competenze in consolidamento",
      insurance_relevance: "Bisogni: protezione famiglia nascente, primi investimenti, previdenza integrativa base",
      action_suggestion: "Pianificazione medio termine, focus su protezione e accumulo",
      color: "#3b82f6",
      icon: "🚀"
    },
    mid: {
      label: "Professionale Esperto",
      description: "5-8 anni di esperienza. Competenze consolidate, possibile ruolo di coordinamento o specializzazione avanzata",
      insurance_relevance: "Bisogni: protezione patrimonio crescente, previdenza integrativa strutturata, prime coperture salute premium",
      action_suggestion: "Diversificazione prodotti, ottimizzazione fiscale iniziale",
      color: "#8b5cf6",
      icon: "💼"
    },
    senior: {
      label: "Senior / Esperto Riconosciuto",
      description: "8-15 anni di esperienza. Ruolo strategico, decisioni importanti, possibile mentorship junior",
      insurance_relevance: "Bisogni: protezione patrimonio consistente, ottimizzazione fiscale, investimenti complessi, salute executive",
      action_suggestion: "Wealth management, pianificazione successoria, protezioni premium",
      color: "#f59e0b",
      icon: "⭐"
    },
    lead: {
      label: "Team Leader",
      description: "Gestisce team, responsabilità su risultati di gruppo, budget e progetti complessi",
      insurance_relevance: "Bisogni: protezione reddito elevato, key man insurance, investimenti strutturati, benefit aziendali",
      action_suggestion: "Soluzioni integrate azienda-persona, protezione ruolo chiave",
      color: "#ec4899",
      icon: "👥"
    },
    manager: {
      label: "Manager / Dirigente",
      description: "Gestisce risorse, budget significativi, progetti strategici, visibilità aziendale",
      insurance_relevance: "Bisogni: protezione patrimonio rilevante, pianificazione successoria, ottimizzazione fiscale avanzata",
      action_suggestion: "Private banking, wealth management, soluzioni executive",
      color: "#ef4444",
      icon: "🎯"
    },
    director: {
      label: "Direttore / C-Level",
      description: "Ruolo esecutivo, decisioni strategiche aziendali, responsabilità P&L",
      insurance_relevance: "Bisogni: protezione patrimonio importante, pianificazione successoria complessa, soluzioni private",
      action_suggestion: "Private wealth, family office, trust e protezione patrimoniale",
      color: "#7c3aed",
      icon: "👑"
    },
    executive: {
      label: "Executive / Top Management",
      description: "C-Suite, board member, decisioni strategiche di massimo livello",
      insurance_relevance: "Bisogni: soluzioni exclusive, protezione reputazione, estate planning, holding e trust",
      action_suggestion: "Family office, consulenza fiduciaria, soluzioni su misura",
      color: "#dc2626",
      icon: "💎"
    }
  }

  return interpretations[level] || {
    label: "Livello Non Determinato",
    description: "Informazioni insufficienti per determinare il livello di seniority",
    insurance_relevance: "Necessaria indagine approfondita per profilare bisogni assicurativi",
    action_suggestion: "Raccogliere più informazioni attraverso conversazione esplorativa",
    color: "#64748b",
    icon: "❓"
  }
}

// ==================== PRIORITY INTERPRETERS ====================

export function interpretPriority(priority: string, context: string = "generico"): Interpretation {
  const interpretations: Record<string, Interpretation> = {
    alta: {
      label: "🔴 URGENTE - Intervento Immediato",
      description: "Richiede azione entro 30 giorni. Situazione che non può essere rimandata",
      insurance_relevance: `Impatto elevato se non affrontato: ${context}`,
      action_suggestion: "Contattare subito con proposta mirata. Preparare offerta completa entro 48h",
      color: "#ef4444",
      icon: "🚨"
    },
    media: {
      label: "🟡 IMPORTANTE - Azione Breve Termine",
      description: "Da affrontare nel breve termine (1-3 mesi). Importante ma non critico",
      insurance_relevance: `Impatto medio se ritardato: ${context}`,
      action_suggestion: "Pianificare follow-up strutturato. Meeting entro 2 settimane",
      color: "#f59e0b",
      icon: "⚠️"
    },
    bassa: {
      label: "🟢 PROGRAMMABILE - Medio Termine",
      description: "Da considerare nel medio termine (3-6 mesi). Può essere pianificato",
      insurance_relevance: `Impatto contenuto se posticipato: ${context}`,
      action_suggestion: "Mantenere contatto informativo. Nurturing a lungo termine",
      color: "#10b981",
      icon: "📅"
    }
  }

  return interpretations[priority] || {
    label: "Priorità Non Specificata",
    description: "Livello di urgenza non determinato",
    insurance_relevance: "Valutare urgenza basandosi sul contesto specifico",
    action_suggestion: "Analizzare situazione per definire timing appropriato",
    color: "#64748b",
    icon: "❓"
  }
}

// ==================== WEALTH INTERPRETERS ====================

export function interpretWealthLevel(
  fascia: string,
  reddito?: { min: number; max: number }
): WealthInterpretation {
  const interpretations: Record<string, WealthInterpretation> = {
    basso: {
      label: "Fascia Base",
      range: "< 25.000€/anno",
      description: "Reddito contenuto. Focus su protezione essenziale e risparmio graduale",
      products: "Assicurazioni vita temporanee, TCM base, piccoli piani accumulo (PAC da 50-100€/mese)",
      tax_considerations: "Detrazioni fiscali su previdenza complementare (massimizzare benefit fiscali)"
    },
    medio_basso: {
      label: "Fascia Medio-Bassa",
      range: "25.000 - 35.000€/anno",
      description: "Reddito stabile con capacità risparmio limitata ma costante",
      products: "Protezione famiglia base, previdenza integrativa, piccoli investimenti programmati",
      tax_considerations: "Ottimizzazione detrazioni previdenza, valutare regime forfettario se autonomo"
    },
    medio: {
      label: "Fascia Media Standard",
      range: "35.000 - 50.000€/anno",
      description: "Buona capacità di risparmio. Possibilità di pianificazione strutturata",
      products: "Protezione famiglia completa, previdenza integrativa seria, portafoglio diversificato",
      tax_considerations: "Ottimizzazione fiscale tramite previdenza, fondi pensione, polizze vita"
    },
    medio_alto: {
      label: "Fascia Medio-Alta",
      range: "50.000 - 100.000€/anno",
      description: "Ottima capacità di risparmio e investimento. Patrimonio in crescita significativa",
      products: "Protezione patrimonio, investimenti diversificati, unit linked, polizze multiramo",
      tax_considerations: "Pianificazione fiscale avanzata, massimizzazione deduzioni, holding familiare"
    },
    alto: {
      label: "Fascia Alta",
      range: "100.000 - 200.000€/anno",
      description: "Patrimonio consistente. Esigenze sofisticate e personalizzate",
      products: "Soluzioni private, wealth management, polizze vita importanti, fondi alternativi",
      tax_considerations: "Ottimizzazione fiscale complessa, holding, trust, protezione patrimoniale"
    },
    molto_alto: {
      label: "Fascia Molto Alta / HNWI",
      range: "> 200.000€/anno",
      description: "High Net Worth Individual. Necessità exclusive e strutture complesse",
      products: "Private banking, family office, soluzioni su misura, investimenti alternativi",
      tax_considerations: "Pianificazione internazionale, trust, holding multi-livello, estate planning"
    },
    lusso: {
      label: "Fascia Lusso / UHNWI",
      range: "> 500.000€/anno",
      description: "Ultra High Net Worth. Strutture patrimoniali complesse",
      products: "Solutions exclusive, art & collectibles insurance, yacht/aviation, reputational risk",
      tax_considerations: "Strutture internazionali, family office, trust discrezionali, succession planning"
    }
  }

  const interp = interpretations[fascia] || {
    label: "Fascia Non Determinata",
    range: "N/D",
    description: "Informazioni insufficienti per stimare capacità economica",
    products: "Necessaria indagine approfondita per profilare correttamente",
    tax_considerations: "Impossibile fornire consigli senza dati economici"
  }

  // Override range se abbiamo dati precisi
  if (reddito) {
    interp.range = `${reddito.min.toLocaleString()}€ - ${reddito.max.toLocaleString()}€/anno`
  }

  return interp
}

// ==================== SOCIAL PRESENCE INTERPRETERS ====================

export function interpretInstagramFollowers(count: number): SocialPresenceInsight {
  if (count < 500) {
    return {
      category: "Utente Base",
      meaning: "Profilo personale con cerchia ristretta di conoscenti. Uso privato dei social",
      insurance_relevance: "Approccio diretto one-to-one. Relazione personale e trust building fondamentali",
      engagement_strategy: "Contatto telefonico o messaggio privato altamente personalizzato. Evitare approccio mass-market"
    }
  }

  if (count < 2000) {
    return {
      category: "Utente Attivo",
      meaning: "Buona rete sociale locale. Influenza nella propria cerchia di amici e colleghi",
      insurance_relevance: "Potenziale referral per passaparola. Social proof importante nelle decisioni",
      engagement_strategy: "Mix di contatto diretto e engagement sui contenuti. Chiedere referral dopo soddisfazione"
    }
  }

  if (count < 10000) {
    return {
      category: "Power User",
      meaning: "Presenza social consolidata. Rete estesa, probabile attività professionale sui social",
      insurance_relevance: "Network ampio: ogni cliente soddisfatto può generare multipli referral",
      engagement_strategy: "Approccio professionale. Fornire valore sui social prima di vendere. Content marketing"
    }
  }

  if (count < 50000) {
    return {
      category: "Micro-Influencer",
      meaning: "Autorità riconosciuta nella propria nicchia. Audience engaged e fiduciosa",
      insurance_relevance: "Partner strategico per network. Alta credibilità = facilità chiusura deal",
      engagement_strategy: "Collaborazioni win-win. Offrire valore (content, expertise) in cambio di visibilità"
    }
  }

  return {
    category: "Influencer / Public Figure",
    meaning: "Figura pubblica con audience significativa. Brand riconoscibile",
    insurance_relevance: "Necessità protezione reputazione, patrimonio e immagine. Rischi specifici",
    engagement_strategy: "Approccio executive. Soluzioni premium. Possibile ambassadorship a lungo termine"
  }
}

export function interpretLinkedInConnections(count: number): SocialPresenceInsight {
  if (count < 100) {
    return {
      category: "Rete Limitata",
      meaning: "Profilo LinkedIn poco sviluppato. Nuovo nel settore o non attivo professionalmente online",
      insurance_relevance: "Possibile insicurezza professionale. Focus su stabilità e protezione base",
      engagement_strategy: "Educare sui benefici. Approccio consulenziale. Costruire fiducia gradualmente"
    }
  }

  if (count < 500) {
    return {
      category: "Rete Standard",
      meaning: "Professionista attivo con network in crescita. Uso professionale di LinkedIn",
      insurance_relevance: "Consolidamento carriera. Attenzione a crescita professionale e patrimoniale",
      engagement_strategy: "Focus su protezione reddito e crescita patrimonio. Caso studio e success stories"
    }
  }

  if (count < 1000) {
    return {
      category: "Networker Attivo",
      meaning: "Professionista molto attivo nel networking. Probabile ruolo business development",
      insurance_relevance: "Network ampio = opportunità referral. Protezione network e relazioni professionali",
      engagement_strategy: "Soluzioni business-oriented. Protezione chiavi aziendali. Partnership strategiche"
    }
  }

  return {
    category: "Super Connector",
    meaning: "Hub del proprio network. Influencer B2B. Punto di riferimento nel settore",
    insurance_relevance: "Partner strategico premium. Ogni deal può generare multipli contatti qualificati",
    engagement_strategy: "Executive approach. Soluzioni custom. Co-marketing e content collaboration"
  }
}

// ==================== CONFIDENCE SCORE INTERPRETERS ====================

export function interpretConfidenceScore(score: number): ConfidenceQuality {
  if (score >= 80) {
    return {
      level: "Eccellente",
      color: "#10b981",
      icon: "✅",
      meaning: "Dati verificati da fonti multiple e autorevoli. Alta coerenza tra le fonti",
      reliability: "Alta affidabilità - Le informazioni possono essere usate per decisioni strategiche con sicurezza",
      actions: "Procedi con fiducia nelle analisi. Puoi presentare proposte dettagliate senza ulteriori verifiche"
    }
  }

  if (score >= 60) {
    return {
      level: "Buono",
      color: "#3b82f6",
      icon: "✓",
      meaning: "Dati confermati da almeno 2 fonti indipendenti. Buona coerenza generale",
      reliability: "Buona affidabilità - Informazioni sostanzialmente accurate, possibili dettagli minori da verificare",
      actions: "Usa i dati come base solida. Integra con conversazione diretta per confermare dettagli specifici"
    }
  }

  if (score >= 40) {
    return {
      level: "Sufficiente",
      color: "#f59e0b",
      icon: "⚠️",
      meaning: "Dati basati su singola fonte o inferenze logiche. Coerenza non verificata",
      reliability: "Affidabilità moderata - Informazioni plausibili ma necessitano conferma su punti chiave",
      actions: "Usa come base esplorativa. Valida assumption con domande mirate durante il contatto"
    }
  }

  return {
    level: "Limitato",
    color: "#ef4444",
    icon: "❌",
    meaning: "Dati insufficienti, contraddittori o basati su assunzioni deboli",
    reliability: "Bassa affidabilità - Informazioni incomplete. Necessaria indagine approfondita",
    actions: "Non fare affidamento su questi dati. Raccogli informazioni tramite conversazione diretta"
  }
}

// ==================== EMPTY STATE EXPLANATIONS ====================

export interface EmptyStateExplanation {
  title: string
  reason: string
  impact: string
  howToImprove: string
  urgency: "low" | "medium" | "high"
}

export function getEmptyStateExplanation(field: string, context?: string): EmptyStateExplanation {
  const explanations: Record<string, EmptyStateExplanation> = {
    // Family
    tipo_zona: {
      title: "Zona di residenza non identificata",
      reason: "Non sono stati trovati dettagli pubblici specifici sulla zona di residenza",
      impact: "Questo dato aiuterebbe a stimare il tenore di vita, le preferenze abitative e il contesto socio-economico",
      howToImprove: "Cercare menzioni di quartieri, zone specifiche o landmark nelle conversazioni social. Chiedere direttamente",
      urgency: "medium"
    },
    eta_stimata: {
      title: "Età non disponibile",
      reason: "Non ci sono informazioni pubbliche sull'età o data di nascita dei familiari",
      impact: "L'età è cruciale per profilare bisogni assicurativi specifici (educazione figli, pensione, salute senior)",
      howToImprove: "Verificare post di compleanni, foto di eventi familiari, menzioni di scuola o università",
      urgency: "high"
    },

    // Career
    livello_seniority: {
      title: "Livello di seniority non determinato",
      reason: "Mancano informazioni su anni di esperienza o progressione di carriera",
      impact: "Il livello di seniority indica capacità economica, stabilità e fase del ciclo di vita professionale",
      howToImprove: "Analizzare LinkedIn per progressione ruoli, chiedere direttamente \"da quanto sei in questa posizione?\"",
      urgency: "high"
    },

    // Wealth
    reddito_stimato: {
      title: "Reddito non stimabile",
      reason: "Dati insufficienti su professione, livello, settore o indicatori di ricchezza visibili",
      impact: "Il reddito è fondamentale per sizing corretto di protezioni e investimenti assicurativi",
      howToImprove: "Inferire da: ruolo + settore + anzianità + zona residenza + lifestyle indicators",
      urgency: "high"
    },

    // Social
    engagement_rate: {
      title: "Tasso di engagement non disponibile",
      reason: "I dati pubblici non includono metriche di engagement (like, commenti, condivisioni)",
      impact: "L'engagement indica influenza reale vs. follower count. Importante per strategie virali",
      howToImprove: "Analizzare manualmente alcuni post recenti per stimare engagement medio",
      urgency: "low"
    }
  }

  return explanations[field] || {
    title: "Informazione non disponibile",
    reason: "Dati insufficienti o non reperibili da fonti pubbliche",
    impact: "Questo dato contribuirebbe a una profilazione più accurata",
    howToImprove: "Raccogliere informazioni attraverso conversazione diretta o indagine mirata",
    urgency: "medium"
  }
}

// ==================== EXPORT ALL ====================

export default {
  interpretCareerLevel,
  interpretPriority,
  interpretWealthLevel,
  interpretInstagramFollowers,
  interpretLinkedInConnections,
  interpretConfidenceScore,
  getEmptyStateExplanation
}
