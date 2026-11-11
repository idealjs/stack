import type { ResolveContext, ResolveResult, StackHook } from './hooks.ts'
import { dirnamePath, joinPath, normalizePath } from './pathUtil.ts'
import { parseTsconfigJson } from './tsconfigJson.ts'

export interface AliasResolveOptions {
  name?: string
  alias?: Record<string, string>
  tsconfig?: boolean | string
}

interface TsRuleSet {
  base: string
  exact: Map<string, string[]>
  stars: { prefix: string; suffix: string; targets: string[] }[]
}

export function aliasResolve(options: AliasResolveOptions = {}): StackHook {
  const name = options.name ?? 'config'
  const aliasEntries = Object.entries(options.alias ?? {})
  const tsconfigEnabled = options.tsconfig !== false
  const tsconfigPathOf = (root: string): string =>
    typeof options.tsconfig === 'string'
      ? joinPath(root, options.tsconfig)
      : joinPath(root, 'tsconfig.json')

  let rootSeen: string | null = null
  let cachedRules: TsRuleSet | null = null

  const resolve = async (
    specifier: string,
    importer: string,
    ctx: ResolveContext,
  ): Promise<ResolveResult | null> => {
    const aliasMapped = aliasMapOf(specifier)
    if (aliasMapped !== null) return dispatchMapped(aliasMapped, specifier, importer, ctx)
    if (!tsconfigEnabled) return null
    const rules = await rulesAt(ctx)
    if (rules === null) return null
    const targets = tsTargetsOf(rules, specifier)
    if (targets.length === 0) return null
    for (const target of targets) {
      const mapped = normalizePath(joinPath(rules.base, target))
      const result = await ctx.resolve(mapped, importer)
      if (result !== null) return result
    }
    return unresolved(specifier, importer, ctx)
  }

  const dispatchMapped = async (
    mapped: string,
    specifier: string,
    importer: string,
    ctx: ResolveContext,
  ): Promise<ResolveResult | null> => {
    const result = await ctx.resolve(mapped, importer)
    return result ?? unresolved(specifier, importer, ctx)
  }

  const unresolved = (specifier: string, importer: string, ctx: ResolveContext): never => {
    throw new Error(
      `[stack] cannot resolve import "${specifier}" from ${importer} (root=${ctx.root})`,
    )
  }

  const aliasMapOf = (specifier: string): string | null => {
    for (const [key, target] of aliasEntries) {
      if (specifier === key) return target
      if (
        specifier.startsWith(key) &&
        (key.endsWith('/') || specifier.charAt(key.length) === '/')
      ) {
        return `${target}${specifier.slice(key.length)}`
      }
    }
    return null
  }

  const rulesAt = async (ctx: ResolveContext): Promise<TsRuleSet | null> => {
    if (rootSeen === ctx.root) return cachedRules
    rootSeen = ctx.root
    cachedRules = await loadRules(ctx)
    return cachedRules
  }

  const loadRules = async (ctx: ResolveContext): Promise<TsRuleSet | null> => {
    const path = tsconfigPathOf(ctx.root)
    let text: string
    try {
      text = await ctx.fs.readFile(path)
    } catch {
      return null
    }
    const parsed = parseTsconfigJson(text)
    const compilerOptions = recordOf(parsed.compilerOptions)
    const rawPaths = recordOf(compilerOptions?.paths)
    if (compilerOptions === null || rawPaths === null) return null
    const ruleSet: TsRuleSet = {
      base:
        typeof compilerOptions.baseUrl === 'string'
          ? normalizePath(joinPath(dirnamePath(path), compilerOptions.baseUrl))
          : dirnamePath(path),
      exact: new Map(),
      stars: [],
    }
    for (const [pattern, targets] of Object.entries(rawPaths)) {
      if (!Array.isArray(targets)) continue
      const valid = targets.filter((target): target is string => typeof target === 'string')
      if (valid.length === 0) continue
      const star = pattern.indexOf('*')
      if (star === -1) ruleSet.exact.set(pattern, valid)
      else {
        ruleSet.stars.push({
          prefix: pattern.slice(0, star),
          suffix: pattern.slice(star + 1),
          targets: valid,
        })
      }
    }
    ruleSet.stars.sort((left, right) => right.prefix.length - left.prefix.length)
    return ruleSet
  }

  return {
    name: `alias:${name}`,
    resolve,
  }
}

const tsTargetsOf = (rules: TsRuleSet, specifier: string): string[] => {
  const exact = rules.exact.get(specifier)
  if (exact !== undefined) return exact
  for (const star of rules.stars) {
    const middle = starMatchOf(star.prefix, star.suffix, specifier)
    if (middle === null) continue
    return star.targets.map((target) => target.replace('*', middle))
  }
  return []
}

const starMatchOf = (prefix: string, suffix: string, specifier: string): string | null => {
  if (!specifier.startsWith(prefix) || !specifier.endsWith(suffix)) return null
  if (specifier.length < prefix.length + suffix.length) return null
  return specifier.slice(prefix.length, specifier.length - suffix.length)
}

const recordOf = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
