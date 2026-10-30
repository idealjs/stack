import { normalizePath } from './pathUtil.ts'

export interface PkgJson {
  name?: string
  main?: string
  module?: string
  browser?: string | Record<string, string | false>
  exports?: unknown
}

export interface PkgStrategy {
  readonly conditions: string[]
  readonly legacyFields: string[]
  readonly browserMap: boolean
}

export const browserStrategy: PkgStrategy = {
  conditions: ['browser', 'import', 'default'],
  legacyFields: ['browser', 'module', 'main'],
  browserMap: true,
}

export const nodeStrategy: PkgStrategy = {
  conditions: ['node', 'import', 'default'],
  legacyFields: ['main'],
  browserMap: false,
}

export const parsePkgJson = (raw: string): PkgJson => {
  const parsed = JSON.parse(raw) as PkgJson
  return typeof parsed === 'object' && parsed !== null ? parsed : {}
}

const exportsTargetOf = (target: unknown, conditions: string[]): string | null => {
  if (typeof target === 'string') return target.startsWith('./') ? target : null
  if (target === null) return null
  if (Array.isArray(target)) {
    for (const item of target) {
      if (item === null) return null
      const matched = exportsTargetOf(item, conditions)
      if (matched !== null) return matched
    }
    return null
  }
  if (typeof target === 'object') {
    for (const [condition, value] of Object.entries(target)) {
      if (condition !== 'default' && !conditions.includes(condition)) continue
      return exportsTargetOf(value, conditions)
    }
  }
  return null
}

const patternMatchOf = (
  exports: Record<string, unknown>,
  subpath: string,
): { target: unknown; substitution: string } | null => {
  let bestKey: string | null = null
  let bestPrefix = ''
  for (const key of Object.keys(exports)) {
    const star = key.indexOf('*')
    if (star === -1) continue
    const prefix = key.slice(0, star)
    const suffix = key.slice(star + 1)
    if (!subpath.startsWith(prefix) || !subpath.endsWith(suffix)) continue
    if (subpath.length < prefix.length + suffix.length) continue
    if (bestKey === null || prefix.length > bestPrefix.length) {
      bestKey = key
      bestPrefix = prefix
    }
  }
  if (bestKey === null) return null
  const suffix = bestKey.slice(bestKey.indexOf('*') + 1)
  return {
    target: exports[bestKey],
    substitution: subpath.slice(bestPrefix.length, subpath.length - suffix.length),
  }
}

export const pkgEntry = (pkg: PkgJson, subpath: string, strategy: PkgStrategy): string | null => {
  const exports = pkg.exports
  if (exports !== undefined) {
    if (typeof exports === 'string' || exports === null || Array.isArray(exports)) {
      return subpath === '.' ? exportsTargetOf(exports, strategy.conditions) : null
    }
    if (typeof exports === 'object') {
      const record = exports as Record<string, unknown>
      const exact = subpath in record ? exportsTargetOf(record[subpath], strategy.conditions) : null
      if (exact !== null) return exact
      const pattern = patternMatchOf(record, subpath)
      if (pattern !== null) {
        const matched = exportsTargetOf(pattern.target, strategy.conditions)
        if (matched !== null) return matched.replaceAll('*', pattern.substitution)
      }
    }
    return null
  }
  if (subpath !== '.') return subpath
  const record = pkg as Record<string, unknown>
  for (const field of strategy.legacyFields) {
    const value = record[field]
    if (typeof value === 'string' && value.length > 0) {
      return value.startsWith('./') || value.startsWith('/') ? value : `./${value}`
    }
  }
  return null
}

export const browserFileMap = (pkg: PkgJson): Record<string, string | false> => {
  const browser = pkg.browser
  if (typeof browser !== 'object' || browser === null || Array.isArray(browser)) return {}
  return browser
}

export type BrowserRemap =
  | { readonly file: string; readonly stub?: undefined }
  | { readonly stub: true; readonly file?: undefined }

export const browserMapLookup = (pkg: PkgJson, key: string): BrowserRemap | null => {
  const map = browserFileMap(pkg)
  const normalized = normalizePath(key.replace(/^\.\//, ''))
  for (const [mapKey, value] of Object.entries(map)) {
    if (normalizePath(mapKey.replace(/^\.\//, '')) !== normalized) continue
    if (value === false) return { stub: true }
    return { file: value }
  }
  return null
}
