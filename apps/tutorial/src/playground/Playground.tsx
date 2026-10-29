import type { ProjectFile } from './context'
import { PlaygroundProvider } from './context'
import { CodeEditor, FileTabs, OutputView, RunRow, SandboxFrame, StatusLine } from './parts'

export interface PlaygroundProps {
  initialFiles?: ProjectFile[]
}

export function Playground({ initialFiles }: PlaygroundProps) {
  return (
    <PlaygroundProvider initialFiles={initialFiles}>
      <StatusLine />
      <FileTabs />
      <CodeEditor />
      <RunRow />
      <OutputView />
      <SandboxFrame />
    </PlaygroundProvider>
  )
}
