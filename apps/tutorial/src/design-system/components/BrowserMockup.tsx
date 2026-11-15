import type { ReactNode } from 'react'

export interface BrowserMockupProps {
  url: string

  children: ReactNode

  className?: string
}

export function BrowserMockup({ url, children, className = '' }: BrowserMockupProps) {
  return (
    <div
      data-comp="browser-mockup"
      className={`overflow-hidden rounded-xl border-2 border-ink bg-paper shadow-ink ${className}`}
    >
      <div className="flex items-center gap-3 border-b-2 border-ink bg-paper-deep px-3 py-2.5">
        <div aria-hidden className="flex shrink-0 gap-1">
          <i className="size-2 rounded-full border-2 border-ink bg-paper" />
          <i className="size-2 rounded-full border-2 border-ink bg-paper" />
          <i className="size-2 rounded-full border-2 border-ink bg-paper" />
        </div>
        <div className="flex h-7 min-w-0 flex-1 items-center gap-1.5 overflow-hidden rounded-full border-2 border-ink bg-paper px-3">
          <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 shrink-0 opacity-60">
            <path
              clipRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
          <span dir="ltr" className="truncate text-[12px] font-bold text-ink">
            {url}
          </span>
        </div>
      </div>
      <div className="bg-white">{children}</div>
    </div>
  )
}
