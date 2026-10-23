#!/usr/bin/env node
import { runCLI } from '../src/node/index.ts'

runCLI(process.argv.slice(2)).catch((error) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : error)
  process.exit(1)
})
