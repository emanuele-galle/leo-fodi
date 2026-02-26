/**
 * OSINT Job Queue System
 * Manages async profiling jobs with status tracking
 */

import { prisma } from '@/lib/db'
import type { ProfilingTarget, CompleteOSINTProfile } from './types'

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface OSINTJob {
  id: string
  jobId: string
  targetData: ProfilingTarget
  status: JobStatus
  progress: number
  currentPhase: string | null
  result: CompleteOSINTProfile | null
  error: string | null
  createdAt: Date
  startedAt: Date | null
  completedAt: Date | null
  updatedAt: Date
}

export class JobQueue {
  /**
   * Create a new profiling job
   */
  static async createJob(target: ProfilingTarget): Promise<string> {
    const jobId = `osint_${Date.now()}_${Math.random().toString(36).substring(7)}`

    await prisma.osintJob.create({
      data: {
        jobId,
        targetData: target as any,
        status: 'pending',
        progress: 0,
        currentPhase: 'Inizializzazione',
      },
    })

    return jobId
  }

  /**
   * Get job status and result
   */
  static async getJob(jobId: string): Promise<OSINTJob | null> {
    const data = await prisma.osintJob.findUnique({
      where: { jobId },
    })

    if (!data) return null

    return {
      id: data.id,
      jobId: data.jobId,
      targetData: data.targetData as ProfilingTarget,
      status: data.status as JobStatus,
      progress: data.progress || 0,
      currentPhase: data.currentPhase,
      result: data.result as CompleteOSINTProfile | null,
      error: data.error,
      createdAt: data.createdAt,
      startedAt: data.startedAt,
      completedAt: data.completedAt,
      updatedAt: data.updatedAt,
    }
  }

  /**
   * Update job status and progress
   */
  static async updateJob(
    jobId: string,
    updates: {
      status?: JobStatus
      progress?: number
      currentPhase?: string
      result?: CompleteOSINTProfile
      error?: string
      startedAt?: Date
      completedAt?: Date
    }
  ): Promise<void> {
    const data: any = {}
    if (updates.status !== undefined) data.status = updates.status
    if (updates.progress !== undefined) data.progress = updates.progress
    if (updates.currentPhase !== undefined) data.currentPhase = updates.currentPhase
    if (updates.result !== undefined) data.result = updates.result as any
    if (updates.error !== undefined) data.error = updates.error
    if (updates.startedAt !== undefined) data.startedAt = updates.startedAt
    if (updates.completedAt !== undefined) data.completedAt = updates.completedAt

    await prisma.osintJob.update({
      where: { jobId },
      data,
    })
  }

  /**
   * Mark job as started
   */
  static async startJob(jobId: string): Promise<void> {
    await this.updateJob(jobId, {
      status: 'processing',
      startedAt: new Date(),
      currentPhase: 'Phase 1: Base Research',
      progress: 10,
    })
  }

  /**
   * Mark job as completed
   */
  static async completeJob(jobId: string, result: CompleteOSINTProfile): Promise<void> {
    await this.updateJob(jobId, {
      status: 'completed',
      completedAt: new Date(),
      currentPhase: 'Completato',
      progress: 100,
      result,
    })
  }

  /**
   * Mark job as failed
   */
  static async failJob(jobId: string, error: string): Promise<void> {
    await this.updateJob(jobId, {
      status: 'failed',
      completedAt: new Date(),
      currentPhase: 'Errore',
      progress: 0,
      error,
    })
  }

  /**
   * Get all jobs (with pagination)
   */
  static async listJobs(limit: number = 50, offset: number = 0): Promise<OSINTJob[]> {
    const data = await prisma.osintJob.findMany({
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    })

    return data.map((item) => ({
      id: item.id,
      jobId: item.jobId,
      targetData: item.targetData as ProfilingTarget,
      status: item.status as JobStatus,
      progress: item.progress || 0,
      currentPhase: item.currentPhase,
      result: item.result as CompleteOSINTProfile | null,
      error: item.error,
      createdAt: item.createdAt,
      startedAt: item.startedAt,
      completedAt: item.completedAt,
      updatedAt: item.updatedAt,
    }))
  }

  /**
   * Delete old completed/failed jobs (cleanup)
   */
  static async cleanupOldJobs(daysOld: number = 7): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await prisma.osintJob.deleteMany({
      where: {
        status: { in: ['completed', 'failed'] },
        completedAt: { lt: cutoffDate },
      },
    })

    return result.count
  }
}
