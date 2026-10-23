import { initialize } from 'esbuild-wasm'
import wasmUrl from 'esbuild-wasm/esbuild.wasm?url'
import { runScenario, SCENARIOS } from '../test/scenarios.ts'

const markDone = (): void => {
  ;(window as unknown as { __stackBrowserTestsDone?: boolean }).__stackBrowserTestsDone = true
}

const appendCase = (name: string, failures: string[]): void => {
  const list = document.getElementById('cases')
  if (list === null) return
  const item = document.createElement('li')
  item.dataset.failed = failures.length === 0 ? 'false' : 'true'
  item.textContent =
    failures.length === 0 ? `通过：${name}` : `失败：${name}——${failures.join('；')}`
  list.appendChild(item)
}

const runAll = async (): Promise<void> => {
  await initialize({ wasmURL: wasmUrl, worker: true })
  let allPassed = true
  for (const scenario of SCENARIOS) {
    const report = await runScenario(scenario)
    appendCase(report.name, report.failures)
    if (report.failures.length > 0) allPassed = false
  }
  document.body.dataset.state = allPassed ? 'passed' : 'failed'
}

runAll()
  .catch((error) => {
    appendCase('harness 启动', [error instanceof Error ? error.message : String(error)])
    document.body.dataset.state = 'failed'
  })
  .finally(markDone)
