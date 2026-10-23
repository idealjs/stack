export interface UserProfile {
  id: number
  name: string
  tags: string[]
}

export function formatGreeting(profile: UserProfile): string {
  const tagText = profile.tags.length === 0 ? '无标签' : profile.tags.join('、')
  return `你好，${profile.name}（#${profile.id}，标签：${tagText}）`
}

export function pickBy<T>(items: readonly T[], keep: (item: T, index: number) => boolean): T[] {
  const picked: T[] = []
  items.forEach((item, index) => {
    if (keep(item, index)) picked.push(item)
  })
  return picked
}

export function summarize<V>(values: readonly V[], describe: (value: V) => string): string {
  return values.map(describe).join(' | ')
}
