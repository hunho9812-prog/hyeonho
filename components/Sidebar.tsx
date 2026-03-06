'use client'

import React, { useState } from 'react'
import { useWorkspace } from '@/lib/WorkspaceContext'
import { Page } from '@/lib/types'

interface PageItemProps {
  pageId: string
  depth: number
}

function PageItem({ pageId, depth }: PageItemProps) {
  const { data, view, setView, createPage, deletePage, toggleExpand, updatePage } = useWorkspace()
  const [hovered, setHovered] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')

  const page = data.pages[pageId]
  if (!page) return null

  const isActive = view.kind === 'page' && view.pageId === pageId

  const handleRename = () => {
    setRenameValue(page.title)
    setRenaming(true)
  }

  const commitRename = () => {
    if (renameValue.trim()) updatePage(pageId, { title: renameValue.trim() })
    setRenaming(false)
  }

  const ICONS = ['📄', '📝', '📚', '📊', '🗂️', '💡', '🔧', '🎯', '📌', '🗒️']
  const [showIconPicker, setShowIconPicker] = useState(false)

  return (
    <div>
      <div
        className={`group flex items-center gap-1 py-[3px] pr-2 rounded-md cursor-pointer select-none text-sm transition-colors ${
          isActive ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false)
          setShowIconPicker(false)
        }}
        onClick={() => setView({ kind: 'page', pageId })}
      >
        {/* Expand toggle */}
        <button
          className="w-4 h-4 flex items-center justify-center text-neutral-400 hover:text-neutral-700 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            if (page.childIds.length > 0) toggleExpand(pageId)
          }}
        >
          {page.childIds.length > 0 ? (
            <svg
              className={`w-3 h-3 transition-transform ${page.isExpanded ? 'rotate-90' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6 6l8 4-8 4V6z" />
            </svg>
          ) : (
            <span />
          )}
        </button>

        {/* Icon */}
        <span
          className="text-sm flex-shrink-0 relative"
          onClick={(e) => {
            e.stopPropagation()
            setShowIconPicker((v) => !v)
          }}
          title="아이콘 변경"
        >
          {page.icon}
          {showIconPicker && (
            <div
              className="absolute left-0 top-6 z-50 bg-white border border-neutral-200 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {ICONS.map((ico) => (
                <button
                  key={ico}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-100 text-base"
                  onClick={() => {
                    updatePage(pageId, { icon: ico })
                    setShowIconPicker(false)
                  }}
                >
                  {ico}
                </button>
              ))}
            </div>
          )}
        </span>

        {/* Title */}
        {renaming ? (
          <input
            autoFocus
            className="flex-1 bg-transparent outline-none border-b border-blue-500 text-neutral-900 text-sm min-w-0"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') setRenaming(false)
              e.stopPropagation()
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate font-medium">{page.title}</span>
        )}

        {/* Actions */}
        {hovered && !renaming && (
          <div className="flex items-center gap-0.5 ml-auto" onClick={(e) => e.stopPropagation()}>
            <button
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700"
              title="하위 페이지 추가"
              onClick={() => {
                const id = createPage(pageId)
                setView({ kind: 'page', pageId: id })
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700"
              title="이름 변경"
              onClick={handleRename}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-100 text-neutral-400 hover:text-red-500"
              title="삭제"
              onClick={() => {
                if (confirm(`"${page.title}" 페이지를 삭제할까요?`)) {
                  deletePage(pageId)
                  // Navigate away if currently viewing this page
                  // The workspace component handles this
                }
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {page.isExpanded &&
        page.childIds.map((childId) => (
          <PageItem key={childId} pageId={childId} depth={depth + 1} />
        ))}
    </div>
  )
}

export default function Sidebar() {
  const { data, view, setView, createPage, sidebarOpen, setSidebarOpen } = useWorkspace()
  const [searchOpen, setSearchOpen] = useState(false)
  const { setSearchQuery } = useWorkspace()

  if (!sidebarOpen) {
    return (
      <button
        className="fixed top-4 left-4 z-40 w-8 h-8 bg-white border border-neutral-200 rounded-md shadow flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-all"
        onClick={() => setSidebarOpen(true)}
        title="사이드바 열기"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    )
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-neutral-50 border-r border-neutral-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-neutral-900 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="font-semibold text-sm text-neutral-900 truncate">Statfordegree Hub</span>
        </div>
        <button
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700"
          onClick={() => setSidebarOpen(false)}
          title="사이드바 닫기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <div className="px-2 py-2 border-b border-neutral-200">
        {/* Search button */}
        <button
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          onClick={() => {
            setSearchQuery('')
            setSearchOpen(true)
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>검색</span>
          <span className="ml-auto text-xs text-neutral-400">⌘K</span>
        </button>

        {/* Dashboard */}
        <button
          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
            view.kind === 'dashboard'
              ? 'bg-neutral-200 text-neutral-900 font-medium'
              : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
          }`}
          onClick={() => setView({ kind: 'dashboard' })}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          홈 대시보드
        </button>

        {/* Task board */}
        <button
          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
            view.kind === 'tasks'
              ? 'bg-neutral-200 text-neutral-900 font-medium'
              : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
          }`}
          onClick={() => setView({ kind: 'tasks' })}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          태스크 보드
          <span className="ml-auto bg-neutral-300 text-neutral-700 text-xs rounded-full px-1.5 py-0.5 font-medium">
            {data.tasks.filter((t) => t.status !== 'done').length}
          </span>
        </button>
      </div>

      {/* Pages list */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        <div className="flex items-center justify-between px-3 py-1 mb-1">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">페이지</span>
          <button
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700"
            title="새 페이지 추가"
            onClick={() => {
              const id = createPage(null)
              setView({ kind: 'page', pageId: id })
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {data.rootPageIds.map((pageId) => (
          <PageItem key={pageId} pageId={pageId} depth={0} />
        ))}

        {data.rootPageIds.length === 0 && (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-neutral-400">페이지가 없습니다</p>
            <button
              className="mt-2 text-sm text-blue-500 hover:text-blue-600"
              onClick={() => {
                const id = createPage(null)
                setView({ kind: 'page', pageId: id })
              }}
            >
              + 첫 페이지 만들기
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 px-4 py-3">
        <p className="text-xs text-neutral-400 text-center">Statfordegree Hub</p>
      </div>

      {/* Search modal */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </aside>
  )
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { searchQuery, setSearchQuery, searchResults, setView } = useWorkspace()
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200">
          <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            className="flex-1 text-base outline-none placeholder-neutral-400"
            placeholder="페이지, 태스크 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          />
          <kbd className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {searchQuery && searchResults.length === 0 && (
            <div className="px-4 py-8 text-center text-neutral-400 text-sm">검색 결과가 없습니다</div>
          )}
          {!searchQuery && (
            <div className="px-4 py-8 text-center text-neutral-400 text-sm">검색어를 입력하세요</div>
          )}
          {searchResults.map((r) => (
            <button
              key={r.id}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-left"
              onClick={() => {
                if (r.type === 'page') setView({ kind: 'page', pageId: r.id })
                else setView({ kind: 'tasks' })
                onClose()
              }}
            >
              <span className="text-lg">{r.icon || (r.type === 'task' ? '✅' : '📄')}</span>
              <div>
                <p className="text-sm font-medium text-neutral-900">{r.title}</p>
                <p className="text-xs text-neutral-400">{r.type === 'page' ? '페이지' : '태스크'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
