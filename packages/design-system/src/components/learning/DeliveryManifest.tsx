export interface DeliveryItem {
  id: string
  label: string
  detail?: string
  href?: string
  ready?: boolean
}

export interface DeliveryManifestProps {
  title: string
  reference?: string
  items: readonly DeliveryItem[]
  className?: string
}

export function DeliveryManifest({ title, reference = 'DELIVERY', items, className = '' }: DeliveryManifestProps) {
  const ready = items.filter((item) => item.ready).length
  return (
    <section data-comp="delivery-manifest" className={`learning-object learning-manifest ${className}`}>
      <header><span className="learning-eyebrow">{reference}</span><span className="learning-manifest-number">{String(items.length).padStart(2, '0')}</span></header>
      <h3>{title}</h3>
      <div className="learning-manifest-heading"><span>交付物 / ARTIFACT</span><span>状态</span></div>
      <ol>
        {items.map((item, index) => (
          <li key={item.id}>
            <span className="learning-manifest-index">{String(index + 1).padStart(2, '0')}</span>
            <div>{item.href ? <a href={item.href}>{item.label}</a> : <b>{item.label}</b>}{item.detail && <small>{item.detail}</small>}</div>
            <span className="learning-manifest-status" data-ready={!!item.ready}>{item.ready ? '✓ 已备齐' : '○ 待交付'}</span>
          </li>
        ))}
      </ol>
      <footer>已备齐 {ready} / {items.length}<span>逐项对照，再交付</span></footer>
    </section>
  )
}
