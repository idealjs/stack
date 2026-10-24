import { build, defineConfig, memoryFs } from '@idealjs/stack'
import { bundle, imports } from '@idealjs/stack/builtins'
import { initialize } from 'esbuild-wasm'
import type { StackSdk } from './sdk'

export const initStack = (wasmURL: string): Promise<void> => initialize({ wasmURL, worker: false })

window.__stack = { build, bundle, defineConfig, imports, initStack, memoryFs } satisfies StackSdk
