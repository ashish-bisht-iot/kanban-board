import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import './TaskCard.css'

const PRIORITY_LABELS = { high: '▲ high', medium: '● med', low: '▼ low' }
const COL_ORDER = ['todo', 'inprogress', 'done']

export default function TaskCard({ task, onDelete, onUpdate, onMove, isDragging }) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging: sortableDragging } =
    useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleSave = () => {
    const trimmed = editText.trim()
    if (trimmed) onUpdate(task.id, trimmed)
    else setEditText(task.text)
    setEditing(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') { setEditText(task.text); setEditing(false) }
  }

  const colIdx = COL_ORDER.indexOf(task.column)
  const canLeft = colIdx > 0
  const canRight = colIdx < COL_ORDER.length - 1

  const createdDate = new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (isDragging) {
    return (
      <div className={`task-card priority-${task.priority} drag-ghost`}>
        <div className="task-text">{task.text}</div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card priority-${task.priority} ${sortableDragging ? 'task-dragging' : ''}`}
    >
      <div className="task-drag-handle" {...attributes} {...listeners}>⠿</div>

      <div className="task-body">
        {editing ? (
          <textarea
            autoFocus
            className="task-edit"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKey}
            rows={2}
          />
        ) : (
          <p className="task-text" onDoubleClick={() => setEditing(true)} title="Double-click to edit">
            {task.text}
          </p>
        )}

        <div className="task-meta">
          <span className={`priority-badge priority-badge-${task.priority}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
          <span className="task-date">{createdDate}</span>
        </div>
      </div>

      <div className="task-actions">
        <div className="move-btns">
          <button
            className="action-btn move-btn"
            onClick={() => onMove(task.id, -1)}
            disabled={!canLeft}
            title="Move left"
          >←</button>
          <button
            className="action-btn move-btn"
            onClick={() => onMove(task.id, 1)}
            disabled={!canRight}
            title="Move right"
          >→</button>
        </div>
        <button
          className="action-btn edit-btn"
          onClick={() => { setEditText(task.text); setEditing(true) }}
          title="Edit task"
        >✎</button>
        <button
          className="action-btn delete-btn"
          onClick={() => onDelete(task.id)}
          title="Delete task"
        >✕</button>
      </div>
    </div>
  )
}
