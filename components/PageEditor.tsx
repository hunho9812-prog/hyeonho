'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useWorkspace } from '@/lib/WorkspaceContext'
import { Block, BlockType } from '@/lib/types'
import { generateId } from '@/lib/storage'

interface BlockEditorProps {
  block: Block
  index: number
  isLast: boolean
  onChange: (content: string) => void
  onCheckedChange: (checked: boolean) => void
  onTypeChange: (type: BlockType) => void
  onNewBlock: (afterIndex: number) => void
  onDeleteBlock: (index: number) => void
  onFocus: () => void
  focusedIndex: number | null
  totalBlocks: number
}

function BlockEditor({
  block,
  index,
  isLast,
  onChange,
  onCheckedChange,
  onTypeChange,
  onNewBlock,
  onDeleteBlock,
  onFocus,
  focusedIndex,
  totalBlocks,
}: BlockEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isFocused = focusedIndex === index
  const [showTypeMenu, setShowTypeMenu] = useState(false)
  const [typeMenuFilter, setTypeMenuFilter] = useState('')

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [block.content])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showTypeMenu) {
      if (e.key === 'Escape') {
        setShowTypeMenu(false)
        setTypeMenuFilter('')
        return
      }
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onNewBlock(index)
    } else if (e.key === 'Backspace' && block.content === '' && totalBlocks > 1) {
      e.preventDefault()
      onDeleteBlock(index)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value

    // Slash command
    if (val === '/') {
      setShowTypeMenu(true)
      setTypeMenuFilter('')
      onChange(val)
      return
    }

    if (showTypeMenu) {
      const filtered = val.slice(1)
      setTypeMenuFilter(filtered)
      if (!val.startsWith('/')) {
        setShowTypeMenu(false)
        setTypeMenuFilter('')
      }
      onChange(val)
      return
    }

    // Markdown-like shortcuts at start of line
    if (val === '# ') {
      onTypeChange('heading1')
      onChange('')
      return
    }
    if (val === '## ') {
      onTypeChange('heading2')
      onChange('')
      return
    }
    if (val === '### ') {
      onTypeChange('heading3')
      onChange('')
      return
    }
    if (val === '- ' || val === '* ') {
      onTypeChange('bullet')
      onChange('')
      return
    }
    if (val === '1. ') {
      onTypeChange('numbered')
      onChange('')
      return
    }
    if (val === '[] ' || val === '[ ] ') {
      onTypeChange('todo')
      onChange('')
      return
    }
    if (val === '> ') {
      onTypeChange('quote')
      onChange('')
      return
    }
    if (val === '```') {
      onTypeChange('code')
      onChange('')
      return
    }

    onChange(val)
  }

  const typeMenuOptions = [
    { type: 'paragraph' as BlockType, label: '텍스트', desc: '일반 텍스트', icon: '¶' },
    { type: 'heading1' as BlockType, label: '제목 1', desc: '큰 제목', icon: 'H1' },
    { type: 'heading2' as BlockType, label: '제목 2', desc: '중간 제목', icon: 'H2' },
    { type: 'heading3' as BlockType, label: '제목 3', desc: '작은 제목', icon: 'H3' },
    { type: 'todo' as BlockType, label: '할 일 목록', desc: '체크박스가 있는 목록', icon: '☑' },
    { type: 'bullet' as BlockType, label: '글머리 기호', desc: '순서 없는 목록', icon: '•' },
    { type: 'numbered' as BlockType, label: '번호 매기기', desc: '순서 있는 목록', icon: '1.' },
    { type: 'quote' as BlockType, label: '인용', desc: '인용문 블록', icon: '"' },
    { type: 'callout' as BlockType, label: '콜아웃', desc: '강조 박스', icon: '💡' },
    { type: 'code' as BlockType, label: '코드', desc: '코드 블록', icon: '</>' },
    { type: 'divider' as BlockType, label: '구분선', desc: '수평선', icon: '—' },
  ]

  const filteredOptions = typeMenuOptions.filter(
    (o) =>
      o.label.toLowerCase().includes(typeMenuFilter.toLowerCase()) ||
      o.type.toLowerCase().includes(typeMenuFilter.toLowerCase())
  )

  const blockClass = (): string => {
    switch (block.type) {
      case 'heading1':
        return 'text-3xl font-bold text-neutral-900 leading-tight'
      case 'heading2':
        return 'text-2xl font-bold text-neutral-800 leading-tight'
      case 'heading3':
        return 'text-xl font-semibold text-neutral-800'
      case 'code':
        return 'font-mono text-sm bg-neutral-100 text-neutral-800 rounded px-3 py-2 w-full'
      case 'quote':
        return 'text-neutral-600 italic pl-4 border-l-4 border-neutral-300'
      default:
        return 'text-neutral-800 leading-relaxed'
    }
  }

  if (block.type === 'divider') {
    return (
      <div className="group flex items-center gap-2 py-2">
        <hr className="flex-1 border-neutral-200" />
        {isFocused && (
          <button
            className="opacity-0 group-hover:opacity-100 text-xs text-neutral-400 hover:text-red-400"
            onClick={() => onDeleteBlock(index)}
          >
            ×
          </button>
        )}
      </div>
    )
  }

  if (block.type === 'callout') {
    return (
      <div
        className="flex gap-3 bg-neutral-50 border border-neutral-200 rounded-lg p-4 group"
        onClick={() => {
          textareaRef.current?.focus()
          onFocus()
        }}
      >
        <span className="text-xl flex-shrink-0">💡</span>
        <textarea
          ref={textareaRef}
          className="flex-1 bg-transparent outline-none resize-none text-neutral-800 leading-relaxed min-h-[24px]"
          value={block.content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          placeholder="콜아웃 내용을 입력하세요..."
          rows={1}
        />
      </div>
    )
  }

  return (
    <div className="group relative flex items-start gap-2">
      {/* Bullet / Number / Todo prefix */}
      <div className="flex-shrink-0 flex items-start pt-1">
        {block.type === 'todo' && (
          <input
            type="checkbox"
            checked={block.checked ?? false}
            onChange={(e) => onCheckedChange(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-blue-600 cursor-pointer mt-0.5"
          />
        )}
        {block.type === 'bullet' && (
          <span className="w-4 h-4 flex items-center justify-center text-neutral-400 mt-1 text-lg leading-none">
            •
          </span>
        )}
        {block.type === 'numbered' && (
          <span className="w-4 h-4 flex items-center text-neutral-500 text-sm font-medium mt-0.5">
            {index + 1}.
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          className={`w-full bg-transparent outline-none resize-none min-h-[24px] placeholder-neutral-300 ${blockClass()} ${
            block.type === 'todo' && block.checked ? 'line-through text-neutral-400' : ''
          }`}
          value={block.content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          placeholder={
            isFocused
              ? block.type === 'paragraph'
                ? "내용을 입력하세요... (/ 로 블록 타입 변경)"
                : `${block.type} 내용...`
              : ''
          }
          rows={1}
        />

        {/* Type command menu */}
        {showTypeMenu && (
          <div className="absolute left-0 top-7 z-50 w-64 bg-white rounded-lg shadow-xl border border-neutral-200 overflow-hidden">
            <div className="px-3 py-2 text-xs text-neutral-400 border-b border-neutral-100">
              블록 타입 선택
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {filteredOptions.map((opt) => (
                <button
                  key={opt.type}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 text-left"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onTypeChange(opt.type)
                    onChange('')
                    setShowTypeMenu(false)
                    setTypeMenuFilter('')
                  }}
                >
                  <span className="w-8 h-8 flex items-center justify-center bg-neutral-100 rounded text-sm font-medium text-neutral-600">
                    {opt.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{opt.label}</p>
                    <p className="text-xs text-neutral-400">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PageEditor({ pageId }: { pageId: string }) {
  const { data, updatePage, updateBlocks, createPage, setView } = useWorkspace()
  const page = data.pages[pageId]
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const titleRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Reset focus when page changes
    setFocusedIndex(null)
    setEditingTitle(false)
  }, [pageId])

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-400">
        <p>페이지를 찾을 수 없습니다</p>
      </div>
    )
  }

  const blocks = page.content.length > 0
    ? page.content
    : [{ id: generateId(), type: 'paragraph' as BlockType, content: '' }]

  const handleBlockChange = (index: number, content: string) => {
    const newBlocks = [...blocks]
    newBlocks[index] = { ...newBlocks[index], content }
    updateBlocks(pageId, newBlocks)
  }

  const handleCheckedChange = (index: number, checked: boolean) => {
    const newBlocks = [...blocks]
    newBlocks[index] = { ...newBlocks[index], checked }
    updateBlocks(pageId, newBlocks)
  }

  const handleTypeChange = (index: number, type: BlockType) => {
    const newBlocks = [...blocks]
    newBlocks[index] = { ...newBlocks[index], type }
    updateBlocks(pageId, newBlocks)
  }

  const handleNewBlock = (afterIndex: number) => {
    const newBlock: Block = {
      id: generateId(),
      type: 'paragraph',
      content: '',
    }
    const newBlocks = [
      ...blocks.slice(0, afterIndex + 1),
      newBlock,
      ...blocks.slice(afterIndex + 1),
    ]
    updateBlocks(pageId, newBlocks)
    setFocusedIndex(afterIndex + 1)
  }

  const handleDeleteBlock = (index: number) => {
    if (blocks.length <= 1) {
      handleBlockChange(0, '')
      return
    }
    const newBlocks = blocks.filter((_, i) => i !== index)
    updateBlocks(pageId, newBlocks)
    setFocusedIndex(Math.max(0, index - 1))
  }

  const parentPage = page.parentId ? data.pages[page.parentId] : null

  const ICONS = ['📄', '📝', '📚', '📊', '🗂️', '💡', '🔧', '🎯', '📌', '🗒️', '🚀', '✨', '🔍', '💼', '🎨']
  const [showIconPicker, setShowIconPicker] = useState(false)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Page header */}
      <div className="flex-shrink-0 border-b border-neutral-100 px-16 pt-4 pb-2">
        <div className="flex items-center gap-2 text-sm text-neutral-400 mb-2">
          {parentPage && (
            <>
              <button
                className="hover:text-neutral-600"
                onClick={() => setView({ kind: 'page', pageId: parentPage.id })}
              >
                {parentPage.icon} {parentPage.title}
              </button>
              <span>/</span>
            </>
          )}
          <span className="text-neutral-600 font-medium">{page.title}</span>
        </div>

        {/* Sub-pages if any */}
        {page.childIds.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-1">
            {page.childIds.map((childId) => {
              const child = data.pages[childId]
              if (!child) return null
              return (
                <button
                  key={childId}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors"
                  onClick={() => setView({ kind: 'page', pageId: childId })}
                >
                  {child.icon} {child.title}
                </button>
              )
            })}
            <button
              className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-500 transition-colors"
              onClick={() => {
                const id = createPage(pageId)
                setView({ kind: 'page', pageId: id })
              }}
            >
              + 하위 페이지 추가
            </button>
          </div>
        )}
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-16 py-10">
          {/* Icon */}
          <div className="relative inline-block mb-4">
            <button
              className="text-5xl hover:opacity-70 transition-opacity"
              onClick={() => setShowIconPicker((v) => !v)}
              title="아이콘 변경"
            >
              {page.icon}
            </button>
            {showIconPicker && (
              <div
                className="absolute left-0 top-14 z-50 bg-white border border-neutral-200 rounded-xl shadow-xl p-3 grid grid-cols-5 gap-2"
              >
                {ICONS.map((ico) => (
                  <button
                    key={ico}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-xl"
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
          </div>

          {/* Title */}
          <div className="mb-6">
            <textarea
              ref={titleRef}
              className="w-full text-4xl font-bold text-neutral-900 bg-transparent outline-none resize-none placeholder-neutral-300 leading-tight"
              value={page.title}
              onChange={(e) => updatePage(pageId, { title: e.target.value })}
              onFocus={() => setEditingTitle(true)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  setFocusedIndex(0)
                }
              }}
              placeholder="제목 없음"
              rows={1}
              style={{ lineHeight: 1.2 }}
            />
            <p className="text-xs text-neutral-400 mt-1">
              최종 수정: {new Date(page.updatedAt).toLocaleString('ko-KR')}
            </p>
          </div>

          {/* Blocks */}
          <div className="space-y-1">
            {blocks.map((block, index) => (
              <BlockEditor
                key={block.id}
                block={block}
                index={index}
                isLast={index === blocks.length - 1}
                focusedIndex={focusedIndex}
                totalBlocks={blocks.length}
                onChange={(content) => handleBlockChange(index, content)}
                onCheckedChange={(checked) => handleCheckedChange(index, checked)}
                onTypeChange={(type) => handleTypeChange(index, type)}
                onNewBlock={handleNewBlock}
                onDeleteBlock={handleDeleteBlock}
                onFocus={() => setFocusedIndex(index)}
              />
            ))}
          </div>

          {/* Click anywhere below to add new block */}
          <div
            className="min-h-32 cursor-text"
            onClick={() => {
              handleNewBlock(blocks.length - 1)
            }}
          />

          {/* Add sub-page button at bottom */}
          {page.childIds.length === 0 && (
            <div className="mt-8 pt-6 border-t border-neutral-100">
              <button
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
                onClick={() => {
                  const id = createPage(pageId)
                  setView({ kind: 'page', pageId: id })
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                하위 페이지 추가
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
