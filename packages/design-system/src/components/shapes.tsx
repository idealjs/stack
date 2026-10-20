import type { CSSProperties, ReactNode } from 'react'

interface ShapeProps {
  size?: number
  className?: string
  style?: CSSProperties
}

export const Tri = ({ size = 24, className, style }: ShapeProps) => (
  <svg
    width={size}
    height={size * 0.92}
    viewBox="0 0 26 24"
    className={className}
    style={style}
    aria-hidden
  >
    <path
      d="M13 2 L25 22 L1 22 Z"
      fill="var(--color-clash1a)"
      stroke="var(--color-ink)"
      strokeWidth="2"
    />
  </svg>
)

export const BrickDot = ({
  size = 14,
  on = false,
  className,
  style,
}: ShapeProps & { on?: boolean }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 14 14"
    className={className}
    style={style}
    aria-hidden
  >
    <circle
      cx="7"
      cy="7"
      r="5"
      fill={on ? 'var(--color-clash2a)' : 'var(--color-paper)'}
      stroke="var(--color-ink)"
      strokeWidth="2"
    />
  </svg>
)

export const Ring = ({ size = 24, className, style }: ShapeProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 26 24"
    className={className}
    style={style}
    aria-hidden
  >
    <circle cx="13" cy="12" r="8" fill="none" stroke="var(--color-clash1b)" strokeWidth="4" />
    <circle cx="13" cy="12" r="8" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" />
  </svg>
)

export const Wave = ({ size = 40, className, style }: ShapeProps) => (
  <svg
    width={size}
    height={size * 0.5}
    viewBox="0 0 40 20"
    className={className}
    style={style}
    aria-hidden
  >
    <path
      d="M2 12 q5 -16 10 0 t10 0 t10 0"
      fill="none"
      stroke="var(--color-clash3b)"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
)

export const Mark = ({ children, className }: { children: ReactNode; className?: string }) => (
  <mark
    className={`-rotate-1 rounded-[3px] bg-clash2a px-[4px] py-[1px] font-bold text-ink [box-decoration-break:clone] ${className ?? ''}`}
  >
    {children}
  </mark>
)
