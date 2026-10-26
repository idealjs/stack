import { initialize } from 'esbuild-wasm'

let initializing: Promise<void> | null = null

export const initEsbuild = (wasmURL = '/esbuild.wasm'): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve()
  initializing ??= initialize({ wasmURL, worker: false }).catch((error: unknown) => {
    initializing = null
    throw error
  })
  return initializing
}
