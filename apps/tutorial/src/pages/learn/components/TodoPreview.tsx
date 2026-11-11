import { useEffect, useRef, useState } from 'react'

const INITIAL_ITEMS = [
  { id: 1, text: '读十页书', done: true },
  { id: 2, text: '整理房间', done: false },
  { id: 3, text: '回复邮件', done: false },
  { id: 4, text: '慢跑 30 分钟', done: false },
  { id: 5, text: '预约体检', done: false },
]

export function TodoPreview() {
  const [items, setItems] = useState(INITIAL_ITEMS)
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const nextId = useRef(6)
  const inputRef = useRef<HTMLInputElement>(null)
  const visible = items.filter((item) =>
    item.text.toLowerCase().includes(search.trim().toLowerCase()),
  )

  useEffect(() => {
    document.body.dataset.learnTodoTotal = String(items.length)
    document.body.dataset.learnTodoMilk = String(items.some((item) => item.text === '买牛奶'))
  }, [items])

  return (
    <section className="learn-todo" aria-label="待办应用演示">
      <div className="learn-todo-heading">
        <b>今天</b>
        <output>
          {items.length} 件 · 完成 {items.filter((item) => item.done).length}
        </output>
        <div className="learn-todo-search">
          <label className="sr-only" htmlFor="todo-preview-search">
            搜索待办
          </label>
          <input
            id="todo-preview-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索待办…"
            autoComplete="off"
          />
          {search !== '' && (
            <button type="button" aria-label="清空搜索" onClick={() => setSearch('')}>
              ×
            </button>
          )}
        </div>
      </div>
      <form
        className="learn-todo-input"
        onSubmit={(event) => {
          event.preventDefault()
          const text = draft.trim()
          if (!text) return
          const id = nextId.current++
          setItems((current) => [...current, { id, text, done: false }])
          setDraft('')
          setSearch('')
          inputRef.current?.focus()
        }}
      >
        <label className="sr-only" htmlFor="todo-preview-input">
          新的待办
        </label>
        <input
          id="todo-preview-input"
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={80}
          placeholder="添加一件待办…"
          autoComplete="off"
        />
        <button type="submit" aria-label="添加待办">
          ＋
        </button>
      </form>
      <ul className="learn-todo-items">
        {visible.map((item) => (
          <li key={item.id} data-todo={item.text}>
            <label>
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => {
                  setItems((current) =>
                    current.map((todo) =>
                      todo.id === item.id ? { ...todo, done: !todo.done } : todo,
                    ),
                  )
                }}
              />
              <span>{item.text}</span>
            </label>
            <button
              type="button"
              aria-label={`删除${item.text}`}
              onClick={() => {
                setItems((current) => current.filter((todo) => todo.id !== item.id))
                inputRef.current?.focus()
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      {visible.length === 0 && (
        <p className="learn-todo-empty">
          {items.length === 0 ? '清单空了，添加一件想做的事吧。' : '没有匹配的待办。'}
        </p>
      )}
      <p className="learn-todo-hint">试着勾选一项，看看界面和计数怎样变化。</p>
    </section>
  )
}
