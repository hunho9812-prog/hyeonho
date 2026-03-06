export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'todo'
  | 'bullet'
  | 'numbered'
  | 'quote'
  | 'code'
  | 'callout'
  | 'divider'

export interface Block {
  id: string
  type: BlockType
  content: string
  checked?: boolean
}

export interface Page {
  id: string
  title: string
  icon: string
  content: Block[]
  parentId: string | null
  childIds: string[]
  isExpanded?: boolean
  createdAt: string
  updatedAt: string
  pinned?: boolean
}

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  dueDate: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface WorkspaceData {
  pages: Record<string, Page>
  rootPageIds: string[]
  tasks: Task[]
}

export type ViewType =
  | { kind: 'dashboard' }
  | { kind: 'page'; pageId: string }
  | { kind: 'tasks' }
