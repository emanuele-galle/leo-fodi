import { getBoss, QUEUES } from './boss'
import { OSINTOrchestrator } from '@/lib/osint/orchestrator'
import { prisma } from '@/lib/db'
import type { ProfilingTarget } from '@/lib/osint/types'
import type PgBoss from 'pg-boss'

interface OsintJobData {
  jobId: string
  targetData: ProfilingTarget
  userId: string | null
}

async function saveOsintProfile(result: Awaited<ReturnType<OSINTOrchestrator['profileTarget']>>, userId: string | null) {
  const targetId = result.target.id
  const existing = await prisma.osintProfile.findFirst({ where: { targetId } })

  const profilePayload = {
    nome: result.target.nome,
    cognome: result.target.cognome,
    profileData: result as object,
    punteggioComplessivo: result.punteggio_complessivo,
    completezzaProfilo: result.completezza_profilo,
    agentUtilizzati: result.agent_utilizzati || [],
    consensoProfilazione: result.target.consenso_profilazione,
    dataConsenso: result.target.data_consenso ? new Date(result.target.data_consenso) : null,
    userId: userId || null,
  }

  if (existing) {
    await prisma.osintProfile.update({ where: { id: existing.id }, data: profilePayload })
  } else {
    await prisma.osintProfile.create({ data: { ...profilePayload, targetId } })
  }
}

export async function registerOsintWorker() {
  const boss = await getBoss()

  await boss.work<OsintJobData>(
    QUEUES.OSINT_JOB,
    {
      batchSize: 4,
      teamSize: 4,
    },
    async (jobs: PgBoss.Job<OsintJobData>[]) => {
      for (const job of jobs) {
        const { jobId, targetData, userId } = job.data

        try {
          await prisma.osintJob.update({
            where: { jobId },
            data: { status: 'processing', startedAt: new Date(), currentPhase: 'Inizializzazione...' },
          })

          const orchestrator = new OSINTOrchestrator()
          const result = await orchestrator.profileTarget(targetData)

          // Save profile to osint_profiles table
          try {
            await saveOsintProfile(result, userId)
          } catch (saveError) {
            console.error('[PgBoss Worker] Failed to save profile to DB:', saveError)
            // Non-fatal: still mark job as completed with result
          }

          await prisma.osintJob.update({
            where: { jobId },
            data: { status: 'completed', result: result as object, completedAt: new Date(), progress: 100 },
          })
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : 'Unknown error'
          console.error(`[PgBoss Worker] Job ${jobId} failed:`, error)
          try {
            await prisma.osintJob.update({
              where: { jobId },
              data: { status: 'failed', error: errMsg, completedAt: new Date() },
            })
          } catch (updateErr) {
            console.error(`[PgBoss Worker] Failed to update job ${jobId} status:`, updateErr)
          }
        }
      }
    }
  )
}
