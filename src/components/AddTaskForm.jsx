import { useState } from 'react'
import './AddTaskForm.css'

export default function AddTaskForm({ onAdd }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [open, setOpen] = useState(false)

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed, priority)
    setText('')
    setPriority('medium')
    setOpen(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="add-bar">
      {open ? (
        <div className="add-form">
          <input
            autoFocus
            className="add-input"
            placeholder="task description..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
          />
          <select
            className={`priority-select priority-${priority}`}
            value={priority}
            onChange={e => setPriority(e.target.value)}
          >
            <option value="high">⬆ High</option>
            <option value="medium">➡ Medium</option>
            <option value="low">⬇ Low</option>
          </select>
          <button className="btn btn-add" onClick={handleSubmit}>
            + Add
          </button>
          <button className="btn btn-cancel" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>
      ) : (
        <button className="add-trigger" onClick={() => setOpen(true)}>
          <span className="add-plus">+</span>
          <span>new task</span>
        </button>
      )}
    </div>
  )
}
