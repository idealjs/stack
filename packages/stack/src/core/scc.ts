export function stronglyConnected<T>(
  nodes: T[],
  idOf: (item: T) => string,
  depsOf: (item: T) => string[],
): T[][] {
  const ids = new Set(nodes.map(idOf))
  const byId = new Map(nodes.map((node) => [idOf(node), node]))
  const indices = new Map<string, number>()
  const lowlinks = new Map<string, number>()
  const onStack = new Set<string>()
  const stack: string[] = []
  const components: T[][] = []
  let counter = 0
  const connect = (id: string): void => {
    indices.set(id, counter)
    lowlinks.set(id, counter)
    counter += 1
    stack.push(id)
    onStack.add(id)
    const node = byId.get(id)
    for (const dep of node === undefined ? [] : depsOf(node)) {
      if (!ids.has(dep)) continue
      if (!indices.has(dep)) {
        connect(dep)
        lowlinks.set(id, Math.min(lowlinks.get(id) ?? counter, lowlinks.get(dep) ?? counter))
      } else if (onStack.has(dep)) {
        lowlinks.set(id, Math.min(lowlinks.get(id) ?? counter, indices.get(dep) ?? counter))
      }
    }
    if (lowlinks.get(id) !== indices.get(id)) return
    const component: T[] = []
    for (;;) {
      const member = stack.pop()
      if (member === undefined) break
      onStack.delete(member)
      const item = byId.get(member)
      if (item !== undefined) component.push(item)
      if (member === id) break
    }
    components.push(component)
  }
  for (const node of nodes) {
    if (!indices.has(idOf(node))) connect(idOf(node))
  }
  return components
}
