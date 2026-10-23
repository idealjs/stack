import assert from 'node:assert/strict'
import test from 'node:test'
import { runScenario, SCENARIOS } from './scenarios.ts'

for (const scenario of SCENARIOS) {
  test(scenario.name, async () => {
    const report = await runScenario(scenario)
    assert.deepEqual(report.failures, [])
  })
}
