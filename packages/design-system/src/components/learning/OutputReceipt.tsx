export interface OutputReceiptProps {
  title: string
  command?: string
  output: string
  defaultExpanded?: boolean
  className?: string
}

export function OutputReceipt({ title, command, output, defaultExpanded = true, className = '' }: OutputReceiptProps) {
  return (
    <div data-comp="output-receipt" className={`learning-object learning-receipt-shell ${className}`}>
      <details className="learning-receipt" open={defaultExpanded}>
        <summary><span className="learning-eyebrow">OUTPUT / 运行回执</span><b>{title}</b></summary>
        <div className="learning-receipt-holes" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => <i key={i} />)}
        </div>
        <div className="learning-receipt-content">
          {command && <div className="learning-receipt-command"><span aria-hidden="true">$ </span><code>{command}</code></div>}
          <pre tabIndex={0} aria-label={`${title}的输出`}><code>{output}</code></pre>
          <div className="learning-receipt-end">— END OF OUTPUT —</div>
        </div>
      </details>
    </div>
  )
}
