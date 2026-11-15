import assert from 'node:assert/strict'
import test from 'node:test'
import { rewriteWithBase } from '../src/node/baseHtml.ts'

test('根绝对 URL 挂 base 前缀，query 与 hash 保留', () => {
  const html = '<a href="/index.html"><script src="/assets/main.js?v=2"></script>'
  const rewritten = rewriteWithBase(html, '/absproxy/9910')
  assert.equal(
    rewritten,
    '<a href="/absproxy/9910/index.html"><script src="/absproxy/9910/assets/main.js?v=2"></script>',
  )
})

test('相对 URL 原样保留——页面 URL 已含 base 前缀，相对解析天然落在代理内，且与 SSG 预渲染的 href 一致、hydration 不分叉', () => {
  const html = '<a href="../index.html"><link href="./src/a.css" /><img src="../shared/logo.png" />'
  const rewritten = rewriteWithBase(html, '/absproxy/9910')
  assert.equal(rewritten, html)
})

test('外部链接、锚点、data URI、协议相对 URL 原样保留', () => {
  const html =
    '<a href="https://idealjs.com">x</a><a href="#top">y</a><img src="data:image/png;base64,AA" /><a href="//cdn.example.com/a.js">z</a>'
  const rewritten = rewriteWithBase(html, '/proxy/9910')
  assert.equal(rewritten, html)
})

test('base 为空时根绝对 URL 规范化后不变', () => {
  const rewritten = rewriteWithBase('<a href="/index.html">', '')
  assert.equal(rewritten, '<a href="/index.html">')
})
