/** 预览面板——dev server 就绪后用 iframe 接入练习工程 */
export function PreviewPanel({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div className="grid h-full place-items-center bg-white p-6 text-center">
        <p className="t-small-mute m-0">dev server 就绪后，练习工程的预览会显示在这里。</p>
      </div>
    )
  }
  return <iframe src={url} title="练习工程预览" className="h-full w-full border-0 bg-white" />
}
