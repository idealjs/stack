export interface CycleEdge {
  from: string
  to: string
}

export class CycleError extends Error {
  readonly path: string[]
  readonly edge: CycleEdge | null

  constructor(path: string[], edge: CycleEdge | null = null) {
    super(`[stack] 循环依赖：${path.join(' → ')}`)
    this.name = 'CycleError'
    this.path = path
    this.edge = edge
  }
}

const shortestPath = (
  edges: Map<string, Set<string>>,
  from: string,
  to: string,
): string[] | null => {
  const queue: string[] = [from]
  const previous = new Map<string, string | null>([[from, '']])
  while (queue.length > 0) {
    const current = queue.shift()
    if (current === undefined) break
    if (current === to) {
      const path: string[] = []
      let node: string | null = current
      while (node !== null && node !== '') {
        path.unshift(node)
        node = previous.get(node) ?? null
      }
      return path
    }
    for (const next of edges.get(current) ?? []) {
      if (previous.has(next)) continue
      previous.set(next, current)
      queue.push(next)
    }
  }
  return null
}

export class CycleDetector {
  readonly #edges = new Map<string, Set<string>>()
  readonly #reach = new Map<string, Set<string>>()
  readonly #alias = new Map<string, string>()

  #normalize(id: string): string {
    let current = id
    for (let step = 0; step < this.#alias.size + 1; step += 1) {
      const next = this.#alias.get(current)
      if (next === undefined) return current
      current = next
    }
    return current
  }

  reaches(from: string, to: string): boolean {
    const fromNode = this.#normalize(from)
    const toNode = this.#normalize(to)
    if (fromNode === toNode) return false
    return this.#reach.get(fromNode)?.has(toNode) ?? false
  }

  addEdge(from: string, to: string): void {
    const fromNode = this.#normalize(from)
    const toNode = this.#normalize(to)
    const edge: CycleEdge = { from: fromNode, to: toNode }
    if (fromNode === toNode) throw new CycleError([fromNode, fromNode], edge)
    if (this.#reach.get(toNode)?.has(fromNode) === true) {
      const path = shortestPath(this.#edges, toNode, fromNode) ?? [toNode, fromNode]
      throw new CycleError([...path, toNode], edge)
    }
    if (this.#reach.get(fromNode)?.has(toNode) === true) return
    if (this.#edges.get(fromNode)?.has(toNode) === true) return
    const fromTargets = this.#edges.get(fromNode) ?? new Set<string>()
    fromTargets.add(toNode)
    this.#edges.set(fromNode, fromTargets)
    if (!this.#edges.has(toNode)) this.#edges.set(toNode, new Set())
    const incoming = this.#collectAncestors(fromNode)
    const gain = new Set<string>([toNode, ...(this.#reach.get(toNode) ?? [])])
    for (const node of incoming) {
      const reach = this.#reach.get(node) ?? new Set<string>()
      for (const target of gain) reach.add(target)
      this.#reach.set(node, reach)
    }
  }

  #collectAncestors(node: string): string[] {
    const found: string[] = []
    for (const [candidate, reach] of this.#reach) {
      if (candidate === node) continue
      if (reach.has(node)) found.push(candidate)
    }
    found.push(node)
    return found
  }

  contract(ids: string[], into: string): void {
    const target = this.#normalize(into)
    for (const id of ids) {
      const normalized = this.#normalize(id)
      if (normalized === target) continue
      this.#alias.set(normalized, target)
    }
    this.#rebuild()
  }

  #rebuild(): void {
    const remapped = new Map<string, Set<string>>()
    const ensure = (node: string): Set<string> => {
      const found = remapped.get(node)
      if (found !== undefined) return found
      const created = new Set<string>()
      remapped.set(node, created)
      return created
    }
    for (const [from, targets] of this.#edges) {
      const fromNode = this.#normalize(from)
      for (const to of targets) {
        const toNode = this.#normalize(to)
        if (fromNode === toNode) continue
        ensure(fromNode).add(toNode)
        ensure(toNode)
      }
    }
    const aliasTargets = new Set(this.#alias.values())
    for (const node of aliasTargets) ensure(node)
    const nodes = [...remapped.keys()]
    this.#edges.clear()
    for (const [node, targets] of remapped) {
      this.#edges.set(node, new Set(targets))
    }
    this.#reach.clear()
    for (const node of nodes) {
      this.#reach.set(node, this.#reachableFrom(node, remapped))
    }
  }

  #reachableFrom(node: string, edges: Map<string, Set<string>>): Set<string> {
    const seen = new Set<string>()
    const stack = [...(edges.get(node) ?? [])]
    while (stack.length > 0) {
      const current = stack.pop()
      if (current === undefined) break
      if (seen.has(current)) continue
      seen.add(current)
      for (const next of edges.get(current) ?? []) {
        if (!seen.has(next)) stack.push(next)
      }
    }
    seen.delete(node)
    return seen
  }
}
