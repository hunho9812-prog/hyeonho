import { WorkspaceData } from './types'
import { DEFAULT_DATA } from './defaultData'

const STORAGE_KEY = 'statfordegree-hub-data'

export function loadWorkspace(): WorkspaceData {
  if (typeof window === 'undefined') return DEFAULT_DATA
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_DATA
    return JSON.parse(stored) as WorkspaceData
  } catch {
    return DEFAULT_DATA
  }
}

export function saveWorkspace(data: WorkspaceData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage might be full — silently ignore
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
