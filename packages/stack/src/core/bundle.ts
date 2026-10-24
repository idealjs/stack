import type { FinalModule, StackHook } from './hooks.ts'
import { type ParsedImport, parseExports, parseModuleImports } from './parse.ts'
import { stronglyConnected } from './scc.ts'

export const moduleRuntime = `const __registry = {}
const __cache = {}
const __define = (id, factory) => {
  __registry[id] = factory
}
const __require = (id) => {
  if (id in __cache) return __cache[id]
  const factory = __registry[id]
  if (factory === undefined) throw new Error('[stack] bundle 运行时找不到模块：' + id)
  const exports = {}
  __cache[id] = exports
  factory(exports, __require)
  return exports
}`

export interface BundleOptions {
  entry: string
  dir: string
  name?: string
  runtime?: string
}

interface Edit {
  start: number
  end: number
  text: string
}

const applyEdits = (code: string, edits: Edit[]): string => {
  const ordered = [...edits].sort((left, right) => right.start - left.start)
  let result = code
  for (const edit of ordered) {
    result = result.slice(0, edit.start) + edit.text + result.slice(edit.end)
  }
  return result
}

const isStaticDeclaration = (parsed: ParsedImport): boolean =>
  !(parsed.declarationStart === parsed.start && parsed.declarationEnd === parsed.end)

const specifierMapOf = (mod: FinalModule): Map<string, string | null> => {
  const map = new Map<string, string | null>()
  for (const ref of mod.imports) {
    if (!map.has(ref.specifier)) map.set(ref.specifier, ref.id)
  }
  return map
}

const exportAssignment = (name: string, expression: string): string =>
  `exports[${JSON.stringify(name)}] = ${expression};`

const internalRequireStatement = (parsed: ParsedImport, id: string): string => {
  const req = `__require(${JSON.stringify(id)})`
  if (parsed.defaultName === null && parsed.namespaceName === null && parsed.named.length === 0) {
    return `${req};`
  }
  if (parsed.namespaceName !== null) return `const ${parsed.namespaceName} = ${req};`
  const slots: string[] = []
  if (parsed.defaultName !== null) slots.push(`default: ${parsed.defaultName}`)
  for (const name of parsed.named) {
    slots.push(name.imported === name.local ? name.local : `${name.imported}: ${name.local}`)
  }
  return `const { ${slots.join(', ')} } = ${req};`
}

const externalOf = (
  externals: Map<string, string>,
  specifier: string,
  use: (varName: string) => string,
): string => {
  let varName = externals.get(specifier)
  if (varName === undefined) {
    varName = `__ext_${externals.size}`
    externals.set(specifier, varName)
  }
  return use(varName)
}

const externalStatement = (parsed: ParsedImport, varName: string): string => {
  const assignments: string[] = []
  if (parsed.defaultName !== null) {
    assignments.push(`const ${parsed.defaultName} = ${varName}.default;`)
  }
  if (parsed.namespaceName !== null) assignments.push(`const ${parsed.namespaceName} = ${varName};`)
  if (parsed.named.length > 0) {
    const slots = parsed.named.map((name) =>
      name.imported === name.local ? name.local : `${name.imported}: ${name.local}`,
    )
    assignments.push(`const { ${slots.join(', ')} } = ${varName};`)
  }
  return assignments.join(' ')
}

const wrapModule = (
  mod: FinalModule,
  closureIds: Set<string>,
  externals: Map<string, string>,
): string => {
  const specifiers = specifierMapOf(mod)
  const edits: Edit[] = []
  const appended: string[] = []
  for (const parsed of parseModuleImports(mod.code)) {
    const resolvedId = specifiers.get(parsed.source) ?? null
    const internal = resolvedId !== null && closureIds.has(resolvedId)
    if (!isStaticDeclaration(parsed)) {
      if (internal && resolvedId !== null) {
        edits.push({
          start: parsed.start,
          end: parsed.end,
          text: `Promise.resolve(__require(${JSON.stringify(resolvedId)}))`,
        })
      }
      continue
    }
    if (internal && resolvedId !== null) {
      edits.push({
        start: parsed.declarationStart,
        end: parsed.declarationEnd,
        text: internalRequireStatement(parsed, resolvedId),
      })
      continue
    }
    edits.push({
      start: parsed.declarationStart,
      end: parsed.declarationEnd,
      text: externalOf(externals, parsed.source, (varName) => externalStatement(parsed, varName)),
    })
  }
  for (const exported of parseExports(mod.code)) {
    if (exported.kind === 'declaration') {
      edits.push({ start: exported.start, end: exported.declarationStart, text: '' })
      for (const name of exported.names) {
        appended.push(exportAssignment(name, name))
      }
      continue
    }
    if (exported.kind === 'default') {
      edits.push({
        start: exported.start,
        end: exported.declarationStart,
        text: 'exports.default = ',
      })
      continue
    }
    if (exported.kind === 'star') {
      if (exported.source === null || exported.names.length === 0) {
        throw new Error(`[stack] bundle 暂不支持 export *（${mod.id}）`)
      }
      const binding = externalOf(externals, exported.source, (varName) => varName)
      appended.push(exportAssignment(exported.names[0], binding))
      edits.push({ start: exported.start, end: exported.end, text: '' })
      continue
    }
    if (exported.source !== null) {
      const resolvedId = specifiers.get(exported.source) ?? null
      const internal = resolvedId !== null && closureIds.has(resolvedId)
      const binding =
        internal && resolvedId !== null
          ? `__require(${JSON.stringify(resolvedId)})`
          : externalOf(externals, exported.source, (varName) => varName)
      for (const entry of exported.list) {
        appended.push(exportAssignment(entry.exported, `${binding}.${entry.local}`))
      }
    } else {
      for (const entry of exported.list) {
        appended.push(exportAssignment(entry.exported, entry.local))
      }
    }
    edits.push({ start: exported.start, end: exported.end, text: '' })
  }
  let body = applyEdits(mod.code, edits)
  if (appended.length > 0) body = `${body}\n${appended.join('\n')}\n`
  return `__define(${JSON.stringify(mod.id)}, (exports, require) => {\n${body}});\n`
}

const concatModule = (mod: FinalModule, closureIds: Set<string>): string => {
  const specifiers = specifierMapOf(mod)
  const edits: Edit[] = []
  for (const parsed of parseModuleImports(mod.code)) {
    if (!isStaticDeclaration(parsed)) continue
    const resolvedId = specifiers.get(parsed.source) ?? null
    if (resolvedId === null || !closureIds.has(resolvedId)) continue
    edits.push({ start: parsed.declarationStart, end: parsed.declarationEnd, text: '' })
  }
  return applyEdits(mod.code, edits)
}

const collectClosure = (modules: FinalModule[], entryId: string): FinalModule[] => {
  const byId = new Map(modules.map((mod) => [mod.id, mod]))
  const entry = byId.get(entryId)
  if (entry === undefined) {
    throw new Error(`[stack] bundle 找不到入口模块：${entryId}`)
  }
  const closure: FinalModule[] = []
  const seen = new Set<string>()
  const visit = (id: string): void => {
    if (seen.has(id)) return
    seen.add(id)
    const mod = byId.get(id)
    if (mod === undefined) return
    for (const dep of mod.deps) visit(dep)
    closure.push(mod)
  }
  visit(entryId)
  return closure
}

export function bundle(options: BundleOptions): StackHook {
  const name = options.name ?? 'bundle'
  return {
    name: `bundle:${name}`,
    derive(ctx) {
      const entry = ctx.inputs.find((input) => input.name === options.entry)
      if (entry === undefined) {
        const known = ctx.inputs.map((input) => input.name).join('、') || '（无）'
        throw new Error(`[stack] bundle 找不到入口 "${options.entry}"，现有输入：${known}`)
      }
      const closure = collectClosure(ctx.modules, entry.id)
      const closureIds = new Set(closure.map((mod) => mod.id))
      const components = stronglyConnected(
        closure,
        (mod) => mod.id,
        (mod) => mod.deps,
      )
      const wrapped = new Set<string>(
        components
          .filter((component) => component.length > 1)
          .flatMap((mod) => mod.map((m) => m.id)),
      )
      let changed = true
      while (changed) {
        changed = false
        for (const mod of closure) {
          if (wrapped.has(mod.id)) continue
          if (mod.deps.some((dep) => wrapped.has(dep))) {
            wrapped.add(mod.id)
            changed = true
          }
        }
      }
      const externals = new Map<string, string>()
      const parts: string[] = []
      for (const component of components) {
        for (const mod of component) {
          parts.push(
            wrapped.has(mod.id)
              ? wrapModule(mod, closureIds, externals)
              : concatModule(mod, closureIds),
          )
        }
      }
      const hoists = [...externals].map(
        ([specifier, varName]) => `import * as ${varName} from ${JSON.stringify(specifier)};`,
      )
      const boot = wrapped.has(entry.id) ? `\n__require(${JSON.stringify(entry.id)});\n` : '\n'
      const code = [options.runtime ?? moduleRuntime, ...hoists, ...parts].join('\n') + boot
      ctx.output({ name, dir: options.dir, files: [{ path: 'bundle.js', code }] })
    },
  }
}
