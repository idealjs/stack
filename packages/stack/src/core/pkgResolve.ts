import type { ReadOnlyFs, ResolveContext, ResolveResult, StackHook } from './hooks.ts'
import {
  browserMapLookup,
  browserStrategy,
  nodeStrategy,
  parsePkgJson,
  pkgEntry,
  type PkgJson,
  type PkgStrategy,
} from './pkgJson.ts'
import {
  dirnamePath,
  isRelativeSpecifier,
  joinPath,
  moduleCandidates,
  normalizePath,
  relativePath,
} from './pathUtil.ts'

const MAX_WALK_DEPTH = 64

export interface PkgResolveOptions {
  name?: string
  platform?: 'browser' | 'node'
  conditions?: string[]
  legacyFields?: string[]
  browserMap?: boolean
}

export function pkgResolve(options: PkgResolveOptions = {}): StackHook {
  const name = options.name ?? options.platform ?? 'browser'
  const strategy = strategyOf(options)
  const pkgDirs = new Map<string, PkgJson | null>()
  const walkCache = new Map<string, string | null>()
  const resolutionCache = new Map<string, ResolveResult | null>()
  let rootSeen: string | null = null

  const dropCaches = (root: string): void => {
    if (rootSeen === root) return
    rootSeen = root
    pkgDirs.clear()
    walkCache.clear()
    resolutionCache.clear()
  }

  const resolveFrom = async (
    specifier: string,
    importer: string,
    ctx: ResolveContext,
    seen: Set<string>,
  ): Promise<ResolveResult | null> => {
    if (isRelativeSpecifier(specifier)) return remapRelative(specifier, importer, ctx, seen)
    if (specifier.startsWith('/')) return null
    return resolveBare(specifier, importer, ctx, seen)
  }

  const resolveBare = async (
    specifier: string,
    importer: string,
    ctx: ResolveContext,
    seen: Set<string>,
  ): Promise<ResolveResult | null> => {
    if (seen.has(specifier)) return null
    seen.add(specifier)
    const cached = resolutionCache.get(`${specifier}\u0000${importer}`)
    if (cached !== undefined) return cached
    const pending = await (async () => {
      if (strategy.browserMap) {
        const shim = await shimOf(specifier, importer, ctx, seen)
        if (shim !== null) return shim
      }
      const parsed = pkgSpecifierOf(specifier)
      if (parsed === null) return null
      const pkgDir = await packageDirOf(ctx, dirnamePath(importer), parsed.name)
      if (pkgDir === null) return null
      const pkg = await pkgJsonAt(ctx, pkgDir)
      if (pkg === null) return null
      const entry = pkgEntryOf(pkg, parsed.subpath)
      if (entry === null) return null
      const id = await probeFirst(ctx.fs, moduleCandidates(joinPath(pkgDir, entry)))
      if (id === null) return null
      return (await remapFileOf(pkg, pkgDir, id, ctx)) ?? { id }
    })()
    resolutionCache.set(`${specifier}\u0000${importer}`, pending)
    return pending
  }

  const remapRelative = async (
    specifier: string,
    importer: string,
    ctx: ResolveContext,
    seen: Set<string>,
  ): Promise<ResolveResult | null> => {
    if (!strategy.browserMap) return null
    const enclosing = await enclosingPackageAt(ctx, importer)
    if (enclosing === null) return null
    const target = joinPath(dirnamePath(importer), specifier)
    if (!target.startsWith(`${enclosing.dir}/`)) return null
    if (seen.has(target)) return null
    seen.add(target)
    const remap = browserMapLookup(enclosing.pkg, relativePath(enclosing.dir, target))
    if (remap === null) return null
    if (remap.stub === true) return stubResult(target)
    const id = await probeFirst(ctx.fs, moduleCandidates(joinPath(enclosing.dir, remap.file)))
    if (id === null) return null
    return (await remapFileOf(enclosing.pkg, enclosing.dir, id, ctx)) ?? { id }
  }

  const shimOf = async (
    specifier: string,
    importer: string,
    ctx: ResolveContext,
    seen: Set<string>,
  ): Promise<ResolveResult | null> => {
    const enclosing = await enclosingPackageAt(ctx, importer)
    if (enclosing === null) return null
    const remap = browserMapLookup(enclosing.pkg, specifier)
    if (remap === null) return null
    if (remap.stub === true) return stubResult(`${enclosing.dir}/${specifier}`)
    if (remap.file.startsWith('./')) {
      const id = await probeFirst(ctx.fs, moduleCandidates(joinPath(enclosing.dir, remap.file)))
      if (id === null) return null
      return (await remapFileOf(enclosing.pkg, enclosing.dir, id, ctx)) ?? { id }
    }
    return resolveFrom(remap.file, importer, ctx, seen)
  }

  const remapFileOf = async (
    pkg: PkgJson,
    pkgDir: string,
    id: string,
    ctx: ResolveContext,
  ): Promise<ResolveResult | null> => {
    const remap = browserMapLookup(pkg, relativePath(pkgDir, id))
    if (remap === null) return null
    if (remap.stub === true) return stubResult(id)
    const remapped = await probeFirst(ctx.fs, moduleCandidates(joinPath(pkgDir, remap.file)))
    return remapped === null ? null : { id: remapped }
  }

  const pkgEntryOf = (pkg: PkgJson, subpath: string): string | null =>
    pkgEntry(pkg, subpath, strategy)

  const pkgJsonAt = async (ctx: ResolveContext, pkgDir: string): Promise<PkgJson | null> => {
    const cached = pkgDirs.get(pkgDir)
    if (cached !== undefined) return cached
    let json: PkgJson | null = null
    try {
      json = parsePkgJson(await ctx.fs.readFile(joinPath(pkgDir, 'package.json')))
    } catch {
      json = null
    }
    pkgDirs.set(pkgDir, json)
    return json
  }

  const packageDirOf = async (
    ctx: ResolveContext,
    fromDir: string,
    pkgName: string,
  ): Promise<string | null> => {
    const cacheKey = `${fromDir}\u0000${pkgName}`
    const cached = walkCache.get(cacheKey)
    if (cached !== undefined) return cached
    const root = normalizePath(ctx.root)
    let dir = normalizePath(fromDir)
    let found: string | null = null
    for (let depth = 0; depth <= MAX_WALK_DEPTH; depth += 1) {
      const candidate = joinPath(dir, 'node_modules', pkgName)
      if ((await pkgJsonAt(ctx, candidate)) !== null) {
        found = candidate
        break
      }
      if (dir === root || dir === '/' || dir === '.') break
      const parent = dirnamePath(dir)
      if (parent === dir) break
      dir = parent
    }
    walkCache.set(cacheKey, found)
    return found
  }

  const enclosingPackageAt = async (
    ctx: ResolveContext,
    importer: string,
  ): Promise<{ dir: string; pkg: PkgJson } | null> => {
    const segments = normalizePath(importer).split('/')
    const marker = segments.lastIndexOf('node_modules')
    if (marker === -1) return null
    const nameStart = marker + 1
    const nameEnd = nameStart + (segments[nameStart]?.startsWith('@') === true ? 2 : 1)
    if (nameEnd > segments.length - 1) return null
    const dir = segments.slice(0, nameEnd).join('/')
    const pkg = await pkgJsonAt(ctx, dir)
    return pkg === null ? null : { dir, pkg }
  }

  return {
    name: `pkg:${name}`,
    resolve: (specifier, importer, ctx) => {
      dropCaches(ctx.root)
      return resolveFrom(specifier, importer, ctx, new Set())
    },
  }
}

const strategyOf = (options: PkgResolveOptions): PkgStrategy => {
  const preset = options.platform === 'node' ? nodeStrategy : browserStrategy
  return {
    conditions: options.conditions ?? preset.conditions,
    legacyFields: options.legacyFields ?? preset.legacyFields,
    browserMap: options.browserMap ?? preset.browserMap,
  }
}

const stubResult = (target: string): ResolveResult => ({
  id: `virtual:pkg-stub:${target}`,
  content: '',
})

const pkgSpecifierOf = (specifier: string): { name: string; subpath: string } | null => {
  if (specifier === '' || specifier === '@' || specifier.startsWith('@')) {
    const [scope, pkgName, ...rest] = specifier.split('/')
    if (scope === undefined || pkgName === undefined || pkgName === '') return null
    return { name: `${scope}/${pkgName}`, subpath: rest.length === 0 ? '.' : `./${rest.join('/')}` }
  }
  const slash = specifier.indexOf('/')
  if (slash === -1) return { name: specifier, subpath: '.' }
  if (slash === 0) return null
  return { name: specifier.slice(0, slash), subpath: `./${specifier.slice(slash + 1)}` }
}

const probeFirst = async (fs: ReadOnlyFs, candidates: string[]): Promise<string | null> => {
  for (const candidate of candidates) {
    try {
      await fs.readFile(candidate)
      return candidate
    } catch {
      continue
    }
  }
  return null
}
