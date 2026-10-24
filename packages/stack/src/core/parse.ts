import { parse } from 'acorn'

export interface ParsedImportName {
  imported: string
  local: string
}

export interface ParsedImport {
  source: string
  start: number
  end: number
  declarationStart: number
  declarationEnd: number
  defaultName: string | null
  namespaceName: string | null
  named: ParsedImportName[]
}

export interface ParsedExportedListEntry {
  local: string
  exported: string
}

export interface ParsedExport {
  kind: 'declaration' | 'list' | 'default' | 'star'
  names: string[]
  list: ParsedExportedListEntry[]
  source: string | null
  start: number
  end: number
  declarationStart: number
}

interface StringLiteral {
  type: 'Literal'
  value: string
  start: number
  end: number
}

interface AstNode {
  type?: string
  start?: number
  end?: number
  source?: StringLiteral
  declaration?: AstNode
  specifiers?: AstNode[]
  local?: AstNode
  imported?: AstNode
  exported?: AstNode
  id?: AstNode
  left?: AstNode
  argument?: AstNode
  elements?: (AstNode | null)[]
  properties?: AstNode[]
  declarations?: AstNode[]
  body?: AstNode[]
  async?: boolean
  [key: string]: unknown
}

interface IdentifierNode {
  name: string
}

const identifierName = (node: AstNode | undefined | null): string | null => {
  if (node === undefined || node === null) return null
  const candidate = node as unknown as IdentifierNode
  return typeof candidate.name === 'string' ? candidate.name : null
}

export function parseModuleImports(code: string): ParsedImport[] {
  const program = parse(code, { ecmaVersion: 'latest', sourceType: 'module' }) as unknown as AstNode
  const collected: ParsedImport[] = []
  for (const statement of program.body ?? []) {
    const declaration = statement as DeclarationWithSource
    if (
      (declaration.type === 'ImportDeclaration' ||
        declaration.type === 'ExportNamedDeclaration' ||
        declaration.type === 'ExportAllDeclaration') &&
      declaration.source?.type === 'Literal'
    ) {
      const clause =
        declaration.type === 'ImportDeclaration' ? importClauseOf(statement) : undefined
      collected.push({
        ...toParsedImport(declaration.source),
        declarationStart: statement.start ?? 0,
        declarationEnd: statement.end ?? 0,
        defaultName: clause?.defaultName ?? null,
        namespaceName: clause?.namespaceName ?? null,
        named: clause?.named ?? [],
      })
    }
  }
  collectDynamicImports(program, collected)
  return collected
}

interface DeclarationWithSource {
  type?: string
  start?: number
  end?: number
  source?: StringLiteral
}

const toParsedImport = (literal: StringLiteral): ParsedImport => ({
  source: literal.value,
  start: literal.start,
  end: literal.end,
  declarationStart: literal.start,
  declarationEnd: literal.end,
  defaultName: null,
  namespaceName: null,
  named: [],
})

interface ImportClause {
  defaultName: string | null
  namespaceName: string | null
  named: ParsedImportName[]
}

const importClauseOf = (statement: AstNode): ImportClause => {
  const clause: ImportClause = { defaultName: null, namespaceName: null, named: [] }
  for (const specifier of statement.specifiers ?? []) {
    const kind = specifier.type
    if (kind === 'ImportDefaultSpecifier') {
      clause.defaultName = identifierName(specifier.local)
    } else if (kind === 'ImportNamespaceSpecifier') {
      clause.namespaceName = identifierName(specifier.local)
    } else if (kind === 'ImportSpecifier') {
      const imported = identifierName(specifier.imported)
      const local = identifierName(specifier.local)
      if (imported !== null && local !== null) clause.named.push({ imported, local })
    }
  }
  return clause
}

function collectDynamicImports(root: AstNode, collected: ParsedImport[]): void {
  const visit = (value: unknown): void => {
    if (value === null || typeof value !== 'object') return
    if (Array.isArray(value)) {
      for (const item of value) visit(item)
      return
    }
    const node = value as AstNode
    if (node.type === 'ImportExpression') {
      const source = node.source
      if (source?.type === 'Literal' && typeof source.value === 'string') {
        collected.push(toParsedImport(source as StringLiteral))
      }
    }
    for (const [key, child] of Object.entries(node)) {
      if (key === 'type' || key === 'start' || key === 'end') continue
      visit(child)
    }
  }
  visit(root)
}

const collectDeclarationNames = (node: AstNode, names: string[]): void => {
  if (node.type === 'VariableDeclaration') {
    for (const declarator of node.declarations ?? []) {
      names.push(...collectPatternNames(declarator.id))
    }
    return
  }
  const name = identifierName(node.id)
  if (name !== null) names.push(name)
}

function collectPatternNames(node: AstNode | null | undefined): string[] {
  if (node === undefined || node === null) return []
  if (node.type === 'Identifier') {
    const name = identifierName(node)
    return name === null ? [] : [name]
  }
  if (node.type === 'ObjectPattern') {
    return (node.properties ?? []).flatMap((property) =>
      collectPatternNames((property.value ?? property.argument) as AstNode | undefined),
    )
  }
  if (node.type === 'ArrayPattern') {
    return (node.elements ?? []).flatMap((element) => collectPatternNames(element))
  }
  if (node.type === 'AssignmentPattern') return collectPatternNames(node.left)
  if (node.type === 'RestElement') return collectPatternNames(node.argument)
  return []
}

export function parseExports(code: string): ParsedExport[] {
  const program = parse(code, { ecmaVersion: 'latest', sourceType: 'module' }) as unknown as AstNode
  const collected: ParsedExport[] = []
  for (const statement of program.body ?? []) {
    if (statement.type === 'ExportNamedDeclaration') {
      const source = statement.source
      const list = (statement.specifiers ?? []).map((specifier) => ({
        local: identifierName(specifier.local) ?? '',
        exported: identifierName(specifier.exported) ?? '',
      }))
      if (statement.declaration !== undefined && statement.declaration !== null) {
        const names: string[] = []
        collectDeclarationNames(statement.declaration, names)
        collected.push({
          kind: 'declaration',
          names,
          list: [],
          source: null,
          start: statement.start ?? 0,
          end: statement.end ?? 0,
          declarationStart: statement.declaration.start ?? statement.start ?? 0,
        })
        continue
      }
      if (source !== undefined && source !== null) {
        collected.push({
          kind: 'list',
          names: [],
          list,
          source: source.value,
          start: statement.start ?? 0,
          end: statement.end ?? 0,
          declarationStart: statement.start ?? 0,
        })
        continue
      }
      collected.push({
        kind: 'list',
        names: [],
        list,
        source: null,
        start: statement.start ?? 0,
        end: statement.end ?? 0,
        declarationStart: statement.start ?? 0,
      })
      continue
    }
    if (statement.type === 'ExportDefaultDeclaration') {
      const declaration = statement.declaration
      const name = identifierName(declaration?.id)
      collected.push({
        kind: 'default',
        names: name === null ? [] : [name],
        list: [],
        source: null,
        start: statement.start ?? 0,
        end: statement.end ?? 0,
        declarationStart: declaration?.start ?? statement.start ?? 0,
      })
      continue
    }
    if (statement.type === 'ExportAllDeclaration') {
      const exported = identifierName(statement.exported)
      collected.push({
        kind: 'star',
        names: exported === null ? [] : [exported],
        list: [],
        source: statement.source?.value ?? null,
        start: statement.start ?? 0,
        end: statement.end ?? 0,
        declarationStart: statement.start ?? 0,
      })
    }
  }
  return collected
}

export function parseTopLevelNames(code: string): string[] {
  const program = parse(code, { ecmaVersion: 'latest', sourceType: 'module' }) as unknown as AstNode
  const names: string[] = []
  for (const statement of program.body ?? []) {
    if (statement.type === 'ImportDeclaration') {
      for (const specifier of (statement as AstNode).specifiers ?? []) {
        const local = identifierName((specifier as AstNode).local)
        if (local !== null) names.push(local)
      }
      continue
    }
    if (statement.type === 'ExportNamedDeclaration') {
      if (statement.declaration !== undefined && statement.declaration !== null) {
        collectDeclarationNames(statement.declaration, names)
      }
      for (const specifier of statement.specifiers ?? []) {
        const local = identifierName(specifier.local)
        if (local !== null) names.push(local)
      }
      continue
    }
    if (statement.type === 'VariableDeclaration') {
      collectDeclarationNames(statement, names)
      continue
    }
    const name = identifierName(statement.id)
    if (name !== null) names.push(name)
  }
  return names
}
