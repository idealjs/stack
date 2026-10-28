const toPosix = (path: string): string => path.replaceAll('\\', '/')

export function normalizePath(path: string): string {
  const posix = toPosix(path)
  const absolute = posix.startsWith('/')
  const segments: string[] = []
  for (const segment of posix.split('/')) {
    if (segment === '' || segment === '.') continue
    if (segment === '..') {
      const top = segments[segments.length - 1]
      if (top !== undefined && top !== '..') segments.pop()
      else if (!absolute) segments.push('..')
      continue
    }
    segments.push(segment)
  }
  const joined = `${absolute ? '/' : ''}${segments.join('/')}`
  return joined === '' ? '.' : joined
}

export const joinPath = (...parts: string[]): string => normalizePath(parts.join('/'))

export function dirnamePath(path: string): string {
  const posix = toPosix(path)
  const index = posix.lastIndexOf('/')
  if (index === -1) return '.'
  if (index === 0) return '/'
  return posix.slice(0, index)
}

const toSegments = (path: string): string[] => {
  const normalized = normalizePath(path)
  return normalized === '.' ? [] : normalized.split('/')
}

export function relativePath(from: string, to: string): string {
  const fromSegments = toSegments(from)
  const toSegmentsOf = toSegments(to)
  let shared = 0
  while (
    shared < fromSegments.length &&
    shared < toSegmentsOf.length &&
    fromSegments[shared] === toSegmentsOf[shared]
  ) {
    shared += 1
  }
  const ups = fromSegments.length - shared
  const downs = toSegmentsOf.slice(shared)
  if (ups === 0 && downs.length === 0) return '.'
  const parts: string[] = []
  for (let i = 0; i < ups; i += 1) parts.push('..')
  parts.push(...downs)
  return parts.join('/')
}

export function replaceExtension(path: string, extension: string): string {
  const posix = toPosix(path)
  const slash = posix.lastIndexOf('/')
  const dot = posix.lastIndexOf('.')
  if (dot > slash) return `${posix.slice(0, dot)}${extension}`
  return `${posix}${extension}`
}

export function toSpecifier(fromDir: string, toPath: string): string {
  const relative = relativePath(fromDir, toPath)
  if (relative === '.') return './index.js'
  return relative.startsWith('.') ? relative : `./${relative}`
}

export const isRelativeSpecifier = (source: string): boolean =>
  source === '.' || source === '..' || source.startsWith('./') || source.startsWith('../')

const MODULE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css']

export const moduleCandidates = (path: string): string[] => [
  path,
  ...MODULE_EXTENSIONS.map((extension) => `${path}${extension}`),
  ...MODULE_EXTENSIONS.map((extension) => joinPath(path, `index${extension}`)),
]
