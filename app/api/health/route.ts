import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getRedisClient } from '@/lib/redis'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`

    let redisOk = false
    const redis = getRedisClient()
    if (redis) {
      try {
        await redis.ping()
        redisOk = true
      } catch {}
    }

    return NextResponse.json({
      status: 'ok',
      db: true,
      redis: redisOk,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: String(error) },
      { status: 500 }
    )
  }
}
