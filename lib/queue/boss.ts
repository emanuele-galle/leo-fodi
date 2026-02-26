import PgBoss from 'pg-boss'

let boss: PgBoss | null = null

export async function getBoss(): Promise<PgBoss> {
  if (!boss) {
    boss = new PgBoss({
      connectionString: process.env.DATABASE_URL!,
      schema: 'pgboss',
    })
    boss.on('error', (err) => console.error('[PgBoss] Error:', err))
    await boss.start()
  }
  return boss
}

export const QUEUES = {
  OSINT_JOB: 'osint-profile',
  LEAD_EXTRACTION: 'lead-extraction',
} as const
