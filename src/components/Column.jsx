import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'
import './Column.css'

export default function Column({ column, tasks, allTasks, onDelete, onUpdate, onMove, isFiltering }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const colTotal = allTasks.filter(t => t.column === column.id).length

  return (
    <div
      className={`column ${isOver ? 'column-over' : ''}`}
      style={{ '--col-color': column.color, '--col-glow': column.glow }}
    >
      <div className="column-header">
        <div className="column-title">
          <span className="column-dot" />
          <span className="column-name">{column.label}</span>
        </div>
        <span className="column-count">
          {isFiltering ? `${tasks.length}/` : ''}{colTotal}
        </span>
      </div>

      <div className="column-body" ref={setNodeRef}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="column-empty">
              {isFiltering ? 'no matches' : 'drop tasks here'}
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onMove={onMove}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
