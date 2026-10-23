import { APP_INFO } from '@/info'
import { formatGreeting, summarize, type UserProfile } from './common/utils'

const profile: UserProfile = { id: 1, name: 'App', tags: ['entry', 'app'] }

console.log(`[${APP_INFO.name}/${APP_INFO.pipeline}] ${formatGreeting(profile)}`)
console.log(
  summarize([`inputs:${APP_INFO.inputs}`, `outputs:${APP_INFO.outputs}`], (item) =>
    item.toUpperCase(),
  ),
)
