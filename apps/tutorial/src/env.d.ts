declare module '*?raw' {
  const content: string
  export default content
}

declare module 'virtual:web-runner-doc' {
  const runtimeDoc: string
  export default runtimeDoc
}

declare module 'virtual:stack-env' {
  const runtimeOrigin: string
  export default runtimeOrigin
}
