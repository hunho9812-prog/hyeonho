'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { WorkspaceData, Page, Block, Task, TaskStatus, ViewType } from './types'
import { loadWorkspace, saveWorkspace, generateId } from './storage'

interface WorkspaceContextValue {
  data: WorkspaceData
  view: ViewType
  setView: (v: ViewType) => void
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void

  // Page actions
  createPage: (parentId: string | null) => string
  updatePage: (pageId: string, changes: Partial<Page>) => void
  deletePage: (pageId: string) => void
  toggleExpand: (pageId: string) => void

  // Block actions
  updateBlocks: (pageId: string, blocks: Block[]) => void

  // Task actions
  createTask: () => string
  updateTask: (taskId: string, changes: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  moveTask: (taskId: string, status: TaskStatus) => void

  // Search
  searchQuery: string
  setSearchQuery: (q: string) => void
  searchResults: Array<{ type: 'page' | 'task'; id: string; title: string; icon?: string }>
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<WorkspaceData>(() => loadWorkspace())
  const [view, setView] = useState<ViewType>({ kind: 'dashboard' })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced save
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveWorkspace(data), 500)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [data])

  const createPage = useCallback(
    (parentId: string | null): string => {
      const id = generateId()
      const now = new Date().toISOString()
      const newPage: Page = {
        id,
        title: '새 페이지',
        icon: '📄',
        content: [{ id: generateId(), type: 'paragraph', content: '' }],
        parentId,
        childIds: [],
        isExpanded: false,
        createdAt: now,
        updatedAt: now,
      }
      setData((prev) => {
        const pages = { ...prev.pages, [id]: newPage }
        let rootPageIds = prev.rootPageIds
        if (parentId) {
          pages[parentId] = {
            ...pages[parentId],
            childIds: [...pages[parentId].childIds, id],
            isExpanded: true,
          }
        } else {
          rootPageIds = [...prev.rootPageIds, id]
        }
        return { ...prev, pages, rootPageIds }
      })
      return id
    },
    []
  )

  const updatePage = useCallback((pageId: string, changes: Partial<Page>) => {
    setData((prev) => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageId]: { ...prev.pages[pageId], ...changes, updatedAt: new Date().toISOString() },
      },
    }))
  }, [])

  const deletePage = useCallback((pageId: string) => {
    setData((prev) => {
      const pages = { ...prev.pages }
      const page = pages[pageId]
      if (!page) return prev

      // Recursively collect all descendant IDs
      const collectIds = (id: string): string[] => {
        const p = pages[id]
        if (!p) return []
        return [id, ...p.childIds.flatMap(collectIds)]
      }
      const toDelete = new Set(collectIds(pageId))

      const newPages: Record<string, Page> = {}
      for (const [k, v] of Object.entries(pages)) {
        if (!toDelete.has(k)) newPages[k] = v
      }

      // Remove from parent
      if (page.parentId && newPages[page.parentId]) {
        newPages[page.parentId] = {
          ...newPages[page.parentId],
          childIds: newPages[page.parentId].childIds.filter((id) => id !== pageId),
        }
      }

      const rootPageIds = prev.rootPageIds.filter((id) => !toDelete.has(id))
      return { ...prev, pages: newPages, rootPageIds }
    })
  }, [])

  const toggleExpand = useCallback((pageId: string) => {
    setData((prev) => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageId]: { ...prev.pages[pageId], isExpanded: !prev.pages[pageId].isExpanded },
      },
    }))
  }, [])

  const updateBlocks = useCallback((pageId: string, blocks: Block[]) => {
    setData((prev) => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageId]: { ...prev.pages[pageId], content: blocks, updatedAt: new Date().toISOString() },
      },
    }))
  }, [])

  const createTask = useCallback((): string => {
    const id = generateId()
    const now = new Date().toISOString()
    const newTask: Task = {
      id,
      title: '새 태스크',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: '',
      dueDate: null,
      tags: [],
      createdAt: now,
      updatedAt: now,
    }
    setData((prev) => ({ ...prev, tasks: [...prev.tasks, newTask] }))
    return id
  }, [])

  const updateTask = useCallback((taskId: string, changes: Partial<Task>) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, ...changes, updatedAt: new Date().toISOString() } : t
      ),
    }))
  }, [])

  const deleteTask = useCallback((taskId: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }))
  }, [])

  const moveTask = useCallback((taskId: string, status: TaskStatus) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t
      ),
    }))
  }, [])

  // Search
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    const results: WorkspaceContextValue['searchResults'] = []
    for (const page of Object.values(data.pages)) {
      if (
        page.title.toLowerCase().includes(q) ||
        page.content.some((b) => b.content.toLowerCase().includes(q))
      ) {
        results.push({ type: 'page', id: page.id, title: page.title, icon: page.icon })
      }
    }
    for (const task of data.tasks) {
      if (task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q)) {
        results.push({ type: 'task', id: task.id, title: task.title })
      }
    }
    return results
  }, [searchQuery, data])

  return (
    <WorkspaceContext.Provider
      value={{
        data,
        view,
        setView,
        sidebarOpen,
        setSidebarOpen,
        createPage,
        updatePage,
        deletePage,
        toggleExpand,
        updateBlocks,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        searchQuery,
        setSearchQuery,
        searchResults,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
