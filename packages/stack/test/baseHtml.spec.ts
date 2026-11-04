import assert from 'node:assert/strict'
import test from 'node:test'
import { rewriteWithBase } from '../src/node/baseHtml.ts'

test('相对 URL 对齐 base 与页面目录', () => {
  const html = '<link href="./src/a.css" /><script src="./main.js"></script>'
  const rewritten = rewriteWithBase(html, '/proxy/9910', '/')
  assert.equal(
    rewritten,
    '<link href="/proxy/9910/src/a.css" /><script src="/proxy/9910/main.js"></script>',
  )
})

test('内部绝对 URL 直接挂 base，跨层页面的相对 URL 按自身目录解析', () => {
  const html = '<a href="/index.html"><img src="../shared/logo.png" /></a>'
  const rewritten = rewriteWithBase(html, '/absproxy/9910', '/learn/deep/index.html')
  assert.equal(
    rewritten,
    '<a href="/absproxy/9910/index.html"><img src="/absproxy/9910/learn/shared/logo.png" /></a>',
  )
})

test('外部链接、锚点、data URI、query 与 hash 原样保留', () => {
  const html =
    '<a href="https://idealjs.com">x</a><a href="#top">y</a><img src="data:image/png;base64,AA" /><a href="./a.html?v=2#s">z</a>'
  const rewritten = rewriteWithBase(html, '/proxy/9910', '/')
  assert.ok(rewritten.includes('href="https://idealjs.com"'))
  assert.ok(rewritten.includes('href="#top"'))
  assert.ok(rewritten.includes('src="data:image/png;base64,AA"'))
  assert.ok(rewritten.includes('href="/proxy/9910/a.html?v=2#s"'))
})

test('base 为空时站内 URL 仍规范为根绝对路径', () => {
  const rewritten = rewriteWithBase('<a href="/index.html"><img src="./logo.png" /></a>', '', '/')
  assert.equal(rewritten, '<a href="/index.html"><img src="/logo.png" /></a>')
})
