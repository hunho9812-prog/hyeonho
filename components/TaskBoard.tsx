'use client'

import React, { useState } from 'react'
import { useWorkspace } from '@/lib/WorkspaceContext'
import { Task, TaskStatus, TaskPriority } from '@/lib/types'

const COLUMNS: { status: TaskStatus; label: string; color: string; bg: string }[] = [
  { status: 'todo', label: '할 일', color: 'text-neutral-600', bg: 'bg-neutral-100' },
  { status: 'in_progress', label: '진행중', color: 'text-blue-600', bg: 'bg-blue-50' },
  { status: 'done', label: '완료', color: 'text-green-600', bg: 'bg-green-50' },
]

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; dot: string }> = {
  high: { label: '높음', color: 'text-red-600 bg-red-50', dot: 'bg-red-500' },
  medium: { label: '보통', color: 'text-yellow-600 bg-yellow-50', dot: 'bg-yellow-500' },
  low: { label: '낮음', color: 'text-green-600 bg-green-50', dot: 'bg-green-500' },
}

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
}

function TaskCard({ task, onEdit }: TaskCardProps) {
  const { moveTask, deleteTask } = useWorkspace()
  const [hovered, setHovered] = useState(false)
  const p = PRIORITY_CONFIG[task.priority]

  const nextStatus: Record<TaskStatus, TaskStatus> = {
    todo: 'in_progress',
    in_progress: 'done',
    done: 'todo',
  }
  const nextLabel: Record<TaskStatus, string> = {
    todo: '→ 진행중으로',
    in_progress: '→ 완료로',
    done: '↺ 다시 시작',
  }

  return (
    <div
      className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer p-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onEdit(task)}
    >
      {/* Priority + Tags */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${p.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
          {p.label}
        </span>
        {task.tags.map((tag) => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <h3 className={`text-sm font-medium text-neutral-900 mb-1 leading-snug ${task.status === 'done' ? 'line-through text-neutral-400' : ''}`}>
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-neutral-500 line-clamp-2 mb-2">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-600">
                {task.assignee.charAt(0)}
              </div>
              <span className="text-xs text-neutral-500 truncate max-w-[80px]">{task.assignee}</span>
            </div>
          )}
        </div>
        {task.dueDate && (
          <span className={`text-xs ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-red-500' : 'text-neutral-400'}`}>
            {new Date(task.dueDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {/* Quick action */}
      {hovered && (
        <div
          className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="text-xs text-blue-500 hover:text-blue-700 font-medium"
            onClick={() => moveTask(task.id, nextStatus[task.status])}
          >
            {nextLabel[task.status]}
          </button>
          <button
            className="text-xs text-red-400 hover:text-red-600"
            onClick={() => {
              if (confirm(`"${task.title}" 태스크를 삭제할까요?`)) deleteTask(task.id)
            }}
          >
            삭제
          </button>
        </div>
      )}
    </div>
  )
}

interface TaskModalProps {
  task: Task | null
  onClose: () => void
}

function TaskModal({ task: initialTask, onClose }: TaskModalProps) {
  const { createTask, updateTask, data } = useWorkspace()
  const [form, setForm] = useState<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>(
    initialTask
      ? {
          title: initialTask.title,
          description: initialTask.description,
          status: initialTask.status,
          priority: initialTask.priority,
          assignee: initialTask.assignee,
          dueDate: initialTask.dueDate,
          tags: initialTask.tags,
        }
      : {
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          assignee: '',
          dueDate: null,
          tags: [],
        }
  )
  const [tagInput, setTagInput] = useState('')

  const handleSave = () => {
    if (!form.title.trim()) return
    if (initialTask) {
      updateTask(initialTask.id, form)
    } else {
      const id = createTask()
      updateTask(id, form)
    }
    onClose()
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }))
    }
    setTagInput('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">
            {initialTask ? '태스크 수정' : '새 태스크 추가'}
          </h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">제목 *</label>
            <input
              autoFocus
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="태스크 제목을 입력하세요"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">설명</label>
            <textarea
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="태스크에 대한 상세 설명..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">상태</label>
              <select
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
              >
                <option value="todo">할 일</option>
                <option value="in_progress">진행중</option>
                <option value="done">완료</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">우선순위</label>
              <select
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}
              >
                <option value="high">높음</option>
                <option value="medium">보통</option>
                <option value="low">낮음</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">담당자</label>
              <input
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.assignee}
                onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}
                placeholder="담당자 이름"
              />
            </div>

            {/* Due date */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">마감일</label>
              <input
                type="date"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={form.dueDate ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value || null }))}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">태그</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs px-2 py-1 bg-neutral-100 rounded-full text-neutral-600"
                >
                  {tag}
                  <button
                    className="hover:text-red-500"
                    onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                placeholder="태그 입력 후 Enter"
              />
              <button
                className="px-3 py-2 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-600"
                onClick={addTag}
              >
                추가
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-3">
          <button
            className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-50"
            onClick={handleSave}
            disabled={!form.title.trim()}
          >
            {initialTask ? '저장' : '추가'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TaskBoard() {
  const { data } = useWorkspace()
  const [editingTask, setEditingTask] = useState<Task | null | undefined>(undefined)
  // undefined = modal closed, null = new task, Task = editing existing

  const tasksByStatus = (status: TaskStatus) => data.tasks.filter((t) => t.status === status)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-8 pt-8 pb-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">태스크 보드</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              전체 {data.tasks.length}개 태스크 · 진행중 {tasksByStatus('in_progress').length}개
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-700 transition-colors"
            onClick={() => setEditingTask(null)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 태스크
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-5 p-8 h-full min-w-max">
          {COLUMNS.map((col) => {
            const tasks = tasksByStatus(col.status)
            return (
              <div key={col.status} className="w-72 flex flex-col">
                {/* Column header */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-lg mb-3 ${col.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${col.color}`}>{col.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-white/70 font-medium ${col.color}`}>
                      {tasks.length}
                    </span>
                  </div>
                  <button
                    className={`w-6 h-6 flex items-center justify-center rounded hover:bg-white/60 ${col.color}`}
                    title="새 태스크 추가"
                    onClick={() => setEditingTask(null)}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={(t) => setEditingTask(t)} />
                  ))}

                  {tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-3xl mb-2 opacity-30">
                        {col.status === 'todo' ? '📋' : col.status === 'in_progress' ? '⚡' : '✅'}
                      </div>
                      <p className="text-xs text-neutral-400">태스크가 없습니다</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      {editingTask !== undefined && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(undefined)}
        />
      )}
    </div>
  )
}
