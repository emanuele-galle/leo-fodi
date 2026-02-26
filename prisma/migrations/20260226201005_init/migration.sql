-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "idToken" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "localita" TEXT,
    "ruolo" TEXT,
    "settore" TEXT,
    "sito_web" TEXT,
    "website_url" TEXT,
    "link_social" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "user_id" TEXT,
    "identita_presenza_online" JSONB NOT NULL,
    "presenza_digitale" JSONB NOT NULL,
    "segnali_autorita" JSONB NOT NULL,
    "modello_lavorativo" JSONB NOT NULL,
    "visione_obiettivi" JSONB NOT NULL,
    "stile_vita" JSONB NOT NULL,
    "mappatura_bisogni" JSONB NOT NULL,
    "leve_ingaggio" JSONB NOT NULL,
    "raccomandazioni_prodotti" JSONB NOT NULL,
    "piano_contatto" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_plans" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "user_id" TEXT,
    "obiettivi_finanziari" JSONB NOT NULL,
    "analisi_gap" JSONB NOT NULL,
    "sequenza_raccomandata" JSONB NOT NULL,
    "spunti_fiscali" JSONB NOT NULL,
    "raccomandazioni_prodotti" JSONB NOT NULL,
    "sintesi_valore" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "osint_jobs" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "target_data" JSONB NOT NULL,
    "current_phase" TEXT,
    "progress" INTEGER DEFAULT 0,
    "result" JSONB,
    "error" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "osint_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "osint_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "target_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "profile_data" JSONB NOT NULL,
    "punteggio_complessivo" INTEGER,
    "completezza_profilo" INTEGER,
    "agent_utilizzati" TEXT[],
    "consenso_profilazione" BOOLEAN NOT NULL DEFAULT false,
    "data_consenso" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "osint_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_searches" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "settore" TEXT NOT NULL,
    "sottocategoria" TEXT,
    "regione" TEXT,
    "provincia" TEXT,
    "comune" TEXT,
    "nazione" TEXT,
    "codice_ateco" TEXT[],
    "fatturato_min" DOUBLE PRECISION,
    "fatturato_max" DOUBLE PRECISION,
    "dipendenti_min" INTEGER,
    "dipendenti_max" INTEGER,
    "anno_fondazione_min" INTEGER,
    "anno_fondazione_max" INTEGER,
    "rating_min" TEXT,
    "fonti_abilitate" JSONB,
    "priorita_fonti" TEXT[],
    "config" JSONB,
    "status" TEXT DEFAULT 'pending',
    "leads_trovati" INTEGER DEFAULT 0,
    "leads_validati" INTEGER DEFAULT 0,
    "fonti_consultate" INTEGER DEFAULT 0,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "search_id" TEXT,
    "ragione_sociale" TEXT NOT NULL,
    "nome_commerciale" TEXT,
    "partita_iva" TEXT,
    "codice_fiscale" TEXT,
    "forma_giuridica" TEXT,
    "settore" TEXT,
    "categoria" TEXT,
    "codice_ateco" TEXT,
    "indirizzo" TEXT,
    "citta" TEXT,
    "cap" TEXT,
    "provincia" TEXT,
    "regione" TEXT,
    "nazione" TEXT,
    "telefono_principale" TEXT,
    "telefono_centralino" TEXT,
    "telefono_mobile" TEXT,
    "telefono_whatsapp" TEXT,
    "email_principale" TEXT,
    "email_pec" TEXT,
    "sito_web" TEXT,
    "facebook_url" TEXT,
    "instagram_url" TEXT,
    "linkedin_url" TEXT,
    "altri_social" JSONB,
    "titolare_nome" TEXT,
    "titolare_cognome" TEXT,
    "legale_rappresentante" TEXT,
    "referenti" JSONB,
    "fatturato" DOUBLE PRECISION,
    "dipendenti" INTEGER,
    "anno_fondazione" INTEGER,
    "rating_creditizio" TEXT,
    "descrizione" TEXT,
    "note" TEXT,
    "fonte_primaria" TEXT,
    "fonti_consultate" TEXT[],
    "affidabilita_score" DOUBLE PRECISION,
    "validazione_status" TEXT,
    "data_estrazione" TIMESTAMP(3),
    "data_validazione" TIMESTAMP(3),
    "ultima_verifica" TIMESTAMP(3),
    "attivo" BOOLEAN DEFAULT true,
    "da_contattare" BOOLEAN DEFAULT true,
    "priorita" TEXT,
    "extra_data" JSONB,
    "raw_data_sc" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_contacts" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT,
    "tipo_contatto" TEXT NOT NULL,
    "valore" TEXT NOT NULL,
    "fonte" TEXT NOT NULL,
    "fonte_url" TEXT,
    "label" TEXT,
    "ufficiale" BOOLEAN DEFAULT false,
    "validato" BOOLEAN DEFAULT false,
    "validazione_metodo" TEXT,
    "validazione_data" TIMESTAMP(3),
    "validazione_note" TEXT,
    "affidabilita" DOUBLE PRECISION,
    "attivo" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_sources" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT,
    "search_id" TEXT,
    "fonte_nome" TEXT NOT NULL,
    "fonte_tipo" TEXT NOT NULL,
    "fonte_url" TEXT,
    "risultato" TEXT NOT NULL,
    "dati_estratti" JSONB,
    "tempo_esecuzione_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_validations" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT,
    "tipo_validazione" TEXT NOT NULL,
    "campo_validato" TEXT NOT NULL,
    "valore_precedente" TEXT,
    "valore_nuovo" TEXT,
    "esito" TEXT NOT NULL,
    "metodo" TEXT,
    "validato_da" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_contact_status" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "contact_status" TEXT NOT NULL,
    "contacted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_contact_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_token_usage" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "client_id" TEXT,
    "profile_id" TEXT,
    "search_id" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'openrouter',
    "model" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "prompt_tokens" INTEGER NOT NULL DEFAULT 0,
    "completion_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_tokens" INTEGER NOT NULL DEFAULT 0,
    "cost_per_1k_prompt" DOUBLE PRECISION,
    "cost_per_1k_completion" DOUBLE PRECISION,
    "total_cost" DOUBLE PRECISION,
    "execution_time_ms" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'success',
    "error_message" TEXT,
    "request_params" JSONB,
    "response_summary" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_token_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_usage_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "provider" TEXT NOT NULL,
    "api_name" TEXT NOT NULL DEFAULT 'unknown',
    "endpoint" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tokens_used" INTEGER,
    "error_message" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_client_id_key" ON "profiles"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "financial_plans_profile_id_key" ON "financial_plans"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "osint_jobs_job_id_key" ON "osint_jobs"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "lead_contact_status_lead_id_key" ON "lead_contact_status"("lead_id");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_plans" ADD CONSTRAINT "financial_plans_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_plans" ADD CONSTRAINT "financial_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "osint_profiles" ADD CONSTRAINT "osint_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_searches" ADD CONSTRAINT "lead_searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_search_id_fkey" FOREIGN KEY ("search_id") REFERENCES "lead_searches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_contacts" ADD CONSTRAINT "lead_contacts_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_sources" ADD CONSTRAINT "lead_sources_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_sources" ADD CONSTRAINT "lead_sources_search_id_fkey" FOREIGN KEY ("search_id") REFERENCES "lead_searches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_validations" ADD CONSTRAINT "lead_validations_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_contact_status" ADD CONSTRAINT "lead_contact_status_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_contact_status" ADD CONSTRAINT "lead_contact_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_token_usage" ADD CONSTRAINT "ai_token_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_token_usage" ADD CONSTRAINT "ai_token_usage_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_token_usage" ADD CONSTRAINT "ai_token_usage_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_token_usage" ADD CONSTRAINT "ai_token_usage_search_id_fkey" FOREIGN KEY ("search_id") REFERENCES "lead_searches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_usage_logs" ADD CONSTRAINT "api_usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
