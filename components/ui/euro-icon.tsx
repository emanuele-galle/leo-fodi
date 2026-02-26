import React from 'react'

interface EuroIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  strokeWidth?: number
}

export function EuroIcon({ className = '', strokeWidth = 2, ...props }: EuroIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M18.5 8C17.5 6 15.5 5 13 5c-3.5 0-6 3-6 7s2.5 7 6 7c2.5 0 4.5-1 5.5-3" />
      <path d="M6 11h8" />
      <path d="M6 15h8" />
    </svg>
  )
}
