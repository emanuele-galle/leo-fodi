'use client'

/**
 * DashboardSkeleton - Loading states per dashboard OSINT
 *
 * Features:
 * - Skeleton per ogni tipo di card (section header, overview, data cards)
 * - Shimmer animation
 * - Variazioni di larghezza realistiche
 * - Border radius matching con componenti reali
 * - Fully customizable
 */

import { designTokens } from '@/lib/design-tokens'

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string
  height?: string
  className?: string
}

/**
 * Base Skeleton component
 */
export function Skeleton({
  variant = 'rectangular',
  width = '100%',
  height = '20px',
  className = ''
}: SkeletonProps) {
  const borderRadius = variant === 'circular'
    ? designTokens.borderRadius.full
    : variant === 'text'
    ? designTokens.borderRadius.sm
    : designTokens.borderRadius.base

  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: `linear-gradient(90deg, ${designTokens.colors.neutral[200]} 25%, ${designTokens.colors.neutral[100]} 50%, ${designTokens.colors.neutral[200]} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite'
      }}
    />
  )
}

/**
 * Section Header Skeleton
 */
export function SectionHeaderSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: designTokens.spacing.md,
        padding: designTokens.spacing.lg,
        background: designTokens.colors.neutral[50],
        borderRadius: designTokens.borderRadius.lg,
        marginBottom: designTokens.spacing.base,
        borderLeft: `4px solid ${designTokens.colors.neutral[300]}`
      }}
    >
      {/* Icon skeleton */}
      <Skeleton variant="circular" width="48px" height="48px" />

      {/* Title and subtitle skeleton */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: designTokens.spacing.xs }}>
          <Skeleton width="180px" height="20px" />
        </div>
        <Skeleton width="260px" height="14px" />
      </div>
    </div>
  )
}

/**
 * Overview Card Skeleton (Score, Sintesi Esecutiva)
 */
export function OverviewCardSkeleton() {
  return (
    <div
      style={{
        padding: designTokens.spacing.lg,
        background: 'white',
        borderRadius: designTokens.borderRadius.lg,
        border: `2px solid ${designTokens.colors.neutral[200]}`,
        boxShadow: designTokens.shadows.sm
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm, marginBottom: designTokens.spacing.lg }}>
        <Skeleton variant="circular" width="40px" height="40px" />
        <Skeleton width="150px" height="20px" />
      </div>

      {/* Content lines */}
      <div style={{ marginBottom: designTokens.spacing.sm }}>
        <Skeleton width="100%" height="16px" />
      </div>
      <div style={{ marginBottom: designTokens.spacing.sm }}>
        <Skeleton width="90%" height="16px" />
      </div>
      <Skeleton width="80%" height="16px" />
    </div>
  )
}

/**
 * Stats Grid Card Skeleton (mini cards)
 */
export function StatsCardSkeleton() {
  return (
    <div
      style={{
        padding: designTokens.spacing.base,
        background: 'white',
        borderRadius: designTokens.borderRadius.lg,
        border: `2px solid ${designTokens.colors.neutral[200]}`,
        borderLeft: `4px solid ${designTokens.colors.neutral[300]}`,
        boxShadow: designTokens.shadows.sm
      }}
    >
      {/* Title */}
      <div style={{ marginBottom: designTokens.spacing.sm }}>
        <Skeleton width="80%" height="14px" />
      </div>

      {/* Value */}
      <div style={{ marginBottom: designTokens.spacing.xs }}>
        <Skeleton width="50%" height="24px" />
      </div>

      {/* Badge */}
      <Skeleton width="60px" height="20px" />
    </div>
  )
}

/**
 * Data Card Skeleton (detailed content cards)
 */
export function DataCardSkeleton() {
  return (
    <div
      style={{
        padding: designTokens.spacing.lg,
        background: 'white',
        borderRadius: designTokens.borderRadius.lg,
        border: `2px solid ${designTokens.colors.neutral[200]}`,
        boxShadow: designTokens.shadows.sm
      }}
    >
      {/* Title */}
      <div style={{ marginBottom: designTokens.spacing.base }}>
        <Skeleton width="40%" height="18px" />
      </div>

      {/* Content lines */}
      <div style={{ marginBottom: designTokens.spacing.sm }}>
        <Skeleton width="100%" height="14px" />
      </div>
      <div style={{ marginBottom: designTokens.spacing.sm }}>
        <Skeleton width="95%" height="14px" />
      </div>
      <div style={{ marginBottom: designTokens.spacing.base }}>
        <Skeleton width="85%" height="14px" />
      </div>

      {/* Metadata */}
      <div style={{ display: 'flex', gap: designTokens.spacing.md, marginTop: designTokens.spacing.lg }}>
        <Skeleton width="80px" height="20px" />
        <Skeleton width="100px" height="20px" />
      </div>
    </div>
  )
}

/**
 * Complete Dashboard Skeleton (full loading state)
 */
export function DashboardSkeleton() {
  return (
    <div style={{ display: 'grid', gap: designTokens.spacing.xl }}>
      {/* Overview Section */}
      <div style={{ display: 'grid', gap: designTokens.spacing.base }}>
        <SectionHeaderSkeleton />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: designTokens.spacing.base }}>
          <OverviewCardSkeleton />
          <OverviewCardSkeleton />
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: designTokens.spacing.base }}>
          {[...Array(12)].map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Data Section */}
      <div style={{ display: 'grid', gap: designTokens.spacing.base }}>
        <SectionHeaderSkeleton />

        <div style={{ display: 'grid', gap: designTokens.spacing.md }}>
          <DataCardSkeleton />
          <DataCardSkeleton />
          <DataCardSkeleton />
        </div>
      </div>

      {/* CSS animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}
