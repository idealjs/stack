#!/usr/bin/node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const require = createRequire(import.meta.url)
const ts = require(require.resolve('typescript', { paths: [join(ROOT, 'apps/tutorial'), ROOT] }))

const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css'])
const SKIP_DIRS = new Set(['node_modules', 'dist', 'dist-runtime', 'test-results', 'playwright-report', '.git', 'build', '.zcode'])
const SCANS = ['packages', 'apps']

const isBiome = (text) => /biome-(ignore|format|check|lint)/.test(text)
// 三斜线指令（/// <reference … />）是编译器指令而非注释，同样保留
const isDirective = (text) => isBiome(text) || /^\/\/\/\s*</.test(text.trim())

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const s = statSync(p)
    if (s.isDirectory()) {
      if (!SKIP_DIRS.has(name)) yield* walk(p)
    } else if (EXTS.has(name.slice(name.lastIndexOf('.')))) {
      yield p
    }
  }
}

const scriptKind = (file) =>
  file.endsWith('.tsx') ? ts.ScriptKind.TSX
  : file.endsWith('.jsx') ? ts.ScriptKind.JSX
  : file.endsWith('.ts') ? ts.ScriptKind.TS
  : ts.ScriptKind.JS

function stripCode(text, file) {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, scriptKind(file))
  const ranges = new Map()
  const visit = (node) => {
    for (const r of ts.getLeadingCommentRanges(text, node.getFullStart()) ?? []) ranges.set(r.pos, r)
    for (const r of ts.getTrailingCommentRanges(text, node.getEnd()) ?? []) ranges.set(r.pos, r)
    ts.forEachChild(node, visit)
  }
  visit(sf)
  let out = text
  let removed = 0
  for (const r of [...ranges.values()].sort((a, b) => b.pos - a.pos)) {
    const slice = text.slice(r.pos, r.end)
    if (isDirective(slice)) continue
    out = out.slice(0, r.pos) + out.slice(r.end)
    removed++
  }
  return { out, removed }
}

function stripCss(text) {
  let out = ''
  let i = 0
  let removed = 0
  while (i < text.length) {
    const ch = text[i]
    if (ch === '"' || ch === "'") {
      const quote = ch
      out += ch
      i++
      while (i < text.length) {
        out += text[i]
        if (text[i] === '\\') {
          out += text[i + 1] ?? ''
          i += 2
          continue
        }
        const close = text[i] === quote
        i++
        if (close) break
      }
      continue
    }
    if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2)
      const stop = end === -1 ? text.length : end + 2
      const slice = text.slice(i, stop)
      if (isBiome(slice)) out += slice
      else removed++
      i = stop
      continue
    }
    out += ch
    i++
  }
  return { out, removed }
}

let files = 0
let removed = 0
for (const base of SCANS) {
  for (const file of walk(join(ROOT, base))) {
    const text = readFileSync(file, 'utf8')
    const { out, removed: n } = file.endsWith('.css') ? stripCss(text) : stripCode(text, file)
    if (n > 0) {
      writeFileSync(file, out)
      removed += n
      files++
      console.log(`${n}\t${file.slice(ROOT.length + 1)}`)
    }
  }
}
console.log(`\n${files} 个文件清除 ${removed} 条注释（biome 指令保留）`)
