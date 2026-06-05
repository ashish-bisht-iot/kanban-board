import { useState, useEffect, useCallback } from 'react'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import Column from './components/Column'
import TaskCard from './components/TaskCard'
import AddTaskForm from './components/AddTaskForm'
import './App.css'

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'var(--todo)', glow: 'var(--todo-glow)' },
  { id: 'inprogress', label: 'In Progress', color: 'var(--progress)', glow: 'var(--progress-glow)' },
  { id: 'done', label: 'Done', color: 'var(--done)', glow: 'var(--done-glow)' },
]

const INITIAL_TASKS = [
  { id: 'task-1', text: 'Set up Vite + React project', column: 'done', priority: 'high', createdAt: Date.now() - 86400000 },
  { id: 'task-2', text: 'Build Kanban board UI', column: 'inprogress', priority: 'high', createdAt: Date.now() - 3600000 },
  { id: 'task-3', text: 'Add drag-and-drop support', column: 'todo', priority: 'medium', createdAt: Date.now() },
  { id: 'task-4', text: 'Deploy to Vercel', column: 'todo', priority: 'low', createdAt: Date.now() },
]

function loadState() {
  try {
    const saved = localStorage.getItem('kanban-tasks')
    return saved ? JSON.parse(saved) : INITIAL_TASKS
  } catch { return INITIAL_TASKS }
}

export default function App() {
  const [tasks, setTasks] = useState(loadState)
  const [search, setSearch] = useState('')
  const [activeTask, setActiveTask] = useState(null)

  useEffect(() => {
    localStorage.setItem('kanban-tasks', JSON.stringify(tasks))
  }, [tasks])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const addTask = useCallback((text, priority) => {
    const newTask = {
      id: `task-${Date.now()}`,
      text,
      column: 'todo',
      priority,
      createdAt: Date.now(),
    }
    setTasks(prev => [...prev, newTask])
  }, [])

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  const updateTask = useCallback((id, text) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, text } : t))
  }, [])

  const moveTask = useCallback((id, direction) => {
    const colOrder = ['todo', 'inprogress', 'done']
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const idx = colOrder.indexOf(t.column)
      const next = colOrder[idx + direction]
      return next ? { ...t, column: next } : t
    }))
  }, [])

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find(t => t.id === active.id) || null)
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    if (!over) return
    const activeId = active.id
    const overId = over.id

    const activeTask = tasks.find(t => t.id === activeId)
    if (!activeTask) return

    // Dropped on a column
    const targetColumn = COLUMNS.find(c => c.id === overId)
    if (targetColumn) {
      if (activeTask.column !== targetColumn.id) {
        setTasks(prev => prev.map(t => t.id === activeId ? { ...t, column: targetColumn.id } : t))
      }
      return
    }

    // Dropped on another task
    const overTask = tasks.find(t => t.id === overId)
    if (!overTask) return

    if (activeTask.column !== overTask.column) {
      setTasks(prev => {
        const updated = prev.map(t => t.id === activeId ? { ...t, column: overTask.column } : t)
        return updated
      })
    } else {
      setTasks(prev => {
        const ids = prev.map(t => t.id)
        const oldIndex = ids.indexOf(activeId)
        const newIndex = ids.indexOf(overId)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const filtered = search.trim()
    ? tasks.filter(t => t.text.toLowerCase().includes(search.toLowerCase()))
    : tasks

  const tasksByColumn = (colId) => filtered.filter(t => t.column === colId)
  const totalByColumn = (colId) => tasks.filter(t => t.column === colId).length

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">⬛</span>
            <span className="logo-text">KANBAN</span>
            <span className="logo-sub">// sprint 05</span>
          </div>
          <div className="board-stats">
            {COLUMNS.map(col => (
              <span key={col.id} className="stat" style={{ '--col': col.color }}>
                <span className="stat-dot" />
                {totalByColumn(col.id)}
              </span>
            ))}
          </div>
        </div>
        <div className="header-right">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              type="text"
              placeholder="filter tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="search-clear" onClick={() => setSearch('')}>×</button>}
          </div>
        </div>
      </header>

      <AddTaskForm onAdd={addTask} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <main className="board">
          {COLUMNS.map(col => (
            <Column
              key={col.id}
              column={col}
              tasks={tasksByColumn(col.id)}
              allTasks={tasks}
              onDelete={deleteTask}
              onUpdate={updateTask}
              onMove={moveTask}
              isFiltering={!!search}
            />
          ))}
        </main>
        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              onDelete={() => {}}
              onUpdate={() => {}}
              onMove={() => {}}
              isDragging
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
