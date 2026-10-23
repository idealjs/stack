import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { composeRuntimeDoc } from './vite-plugin.ts'

const here = fileURLToPath(new URL('.', import.meta.url))
mkdirSync(resolve(here, 'dist-runtime'), { recursive: true })
writeFileSync(resolve(here, 'dist-runtime/index.html'), await composeRuntimeDoc())
