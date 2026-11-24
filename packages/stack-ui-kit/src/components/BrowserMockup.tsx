import type { ReactNode } from 'react'
import {
  mockup,
  mockupAddress,
  mockupAddressIcon,
  mockupAddressText,
  mockupBar,
  mockupDot,
  mockupDots,
  mockupViewport,
} from './browserMockup.css.ts'

export interface BrowserMockupProps {
  url: string

  children: ReactNode

  className?: string
}

export function BrowserMockup({ url, children, className = '' }: BrowserMockupProps) {
  return (
    <div data-comp="browser-mockup" className={`${mockup} ${className}`}>
      <div className={mockupBar}>
        <div aria-hidden className={mockupDots}>
          <i className={mockupDot} />
          <i className={mockupDot} />
          <i className={mockupDot} />
        </div>
        <div className={mockupAddress}>
          <svg aria-hidden viewBox="0 0 16 16" className={mockupAddressIcon}>
            <path
              clipRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
          <span dir="ltr" className={mockupAddressText}>
            {url}
          </span>
        </div>
      </div>
      <div className={mockupViewport}>{children}</div>
    </div>
  )
}
