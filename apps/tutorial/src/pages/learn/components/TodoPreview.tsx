import { useRef, useState } from 'react'

const INITIAL_ITEMS = [
  { id: 1, text: '读十页书', done: true },
  { id: 2, text: '买牛奶', done: false },
]

export function TodoPreview() {
  const [items, setItems] = useState(INITIAL_ITEMS)
  const [draft, setDraft] = useState('')
  const nextId = useRef(3)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="learn-todo" role="group" aria-label="待办应用演示">
      <div className="learn-todo-heading">
        <b>今天</b>
        <span role="status">
          {items.length} 件 · 完成 {items.filter((item) => item.done).length}
        </span>
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
        {items.map((item) => (
          <li key={item.id}>
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
      {items.length === 0 && <p className="learn-todo-empty">清单空了，添加一件想做的事吧。</p>}
      <p className="learn-todo-hint">试着勾选一项，看看界面和计数怎样变化。</p>
    </div>
  )
}
