import { parse } from 'acorn'

export interface ParsedImport {
  source: string
  start: number
  end: number
}

interface StringLiteral {
  type: 'Literal'
  value: string
  start: number
  end: number
}

interface DeclarationWithSource {
  type: string
  source?: StringLiteral
}

interface AstNode {
  type?: string
  source?: { type: string; value?: unknown; start: number; end: number }
  body?: AstNode[]
  [key: string]: unknown
}

const isImportExportDeclaration = (node: AstNode): boolean =>
  node.type === 'ImportDeclaration' ||
  node.type === 'ExportNamedDeclaration' ||
  node.type === 'ExportAllDeclaration'

export function parseModuleImports(code: string): ParsedImport[] {
  const program = parse(code, { ecmaVersion: 'latest', sourceType: 'module' }) as unknown as AstNode
  const collected: ParsedImport[] = []
  for (const statement of program.body ?? []) {
    const declaration = statement as DeclarationWithSource
    if (isImportExportDeclaration(statement) && declaration.source?.type === 'Literal') {
      collected.push(toParsedImport(declaration.source))
    }
  }
  collectDynamicImports(program, collected)
  return collected
}

const toParsedImport = (literal: StringLiteral): ParsedImport => ({
  source: literal.value,
  start: literal.start,
  end: literal.end,
})

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
        collected.push({ source: source.value, start: source.start, end: source.end })
      }
    }
    for (const [key, child] of Object.entries(node)) {
      if (key === 'type' || key === 'start' || key === 'end') continue
      visit(child)
    }
  }
  visit(root)
}
