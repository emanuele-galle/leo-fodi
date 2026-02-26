/**
 * N8N Webhooks Integration
 * Silent fail — non blocca mai il processo principale se N8N non risponde
 */

const N8N_BASE_URL = process.env.N8N_INTERNAL_URL || 'http://vps-panel-n8n:5678'
const WEBHOOK_TIMEOUT_MS = 3000

async function postWebhook(path: string, payload: unknown): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[N8N] Webhook ${path}:`, JSON.stringify(payload))
    return
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS)

    await fetch(`${N8N_BASE_URL}/webhook${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
  } catch (error) {
    // Silent fail — N8N non deve mai bloccare il processo principale
    console.warn(`[N8N] Webhook ${path} failed (silent):`, (error as Error).message)
  }
}

export const n8nWebhooks = {
  async notifyOsintComplete(data: {
    profileId: string
    targetName: string
    completenessScore?: number
    confidenceAvg?: number
    executionMs?: number
  }): Promise<void> {
    await postWebhook('/osint-complete', data)
  },

  async notifyCostAlert(data: {
    totalCostToday: number
    model: string
    tokens: number
    threshold: number
  }): Promise<void> {
    await postWebhook('/cost-alert', data)
  },

  async notifyLeadReport(data: {
    totalLeads: number
    avgScore?: number
    extractionJobId?: string
  }): Promise<void> {
    await postWebhook('/lead-report', data)
  },
}
