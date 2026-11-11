export const parseTsconfigJson = (text: string): Record<string, unknown> => {
  const clean = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  try {
    return JSON.parse(clean) as Record<string, unknown>
  } catch {
    try {
      return JSON.parse(stripJsonc(clean)) as Record<string, unknown>
    } catch {
      return {}
    }
  }
}

const stripJsonc = (text: string): string => {
  let result = ''
  let index = 0
  let inString = false
  while (index < text.length) {
    const char = text[index]
    if (inString) {
      result += char
      if (char === '\\') {
        result += text[index + 1] ?? ''
        index += 2
        continue
      }
      if (char === '"') inString = false
      index += 1
      continue
    }
    if (char === '"') {
      inString = true
      result += char
      index += 1
      continue
    }
    if (char === '/' && text[index + 1] === '/') {
      while (index < text.length && text[index] !== '\n') index += 1
      continue
    }
    if (char === '/' && text[index + 1] === '*') {
      index += 2
      while (index < text.length && !(text[index] === '*' && text[index + 1] === '/')) index += 1
      index += 2
      continue
    }
    if (char === ',') {
      let lookahead = index + 1
      while (lookahead < text.length && /\s/.test(text[lookahead])) lookahead += 1
      const next = text[lookahead]
      if (next === '}' || next === ']') {
        index += 1
        continue
      }
    }
    result += char
    index += 1
  }
  return result
}
