import { APP_INFO } from '@/info'
import { pickBy, type UserProfile } from './common/utils'

const profiles: UserProfile[] = [
  { id: 1, name: 'alpha', tags: ['x'] },
  { id: 2, name: 'beta', tags: [] },
  { id: 3, name: 'gamma', tags: ['y'] },
]

const oddOnes = pickBy(profiles, (profile) => profile.id % 2 === 1)

console.log(`[${APP_INFO.name}] 奇数 id：${oddOnes.map((profile) => profile.name).join('、')}`)
