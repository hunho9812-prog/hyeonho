'use client'

import React from 'react'
import { useWorkspace } from '@/lib/WorkspaceContext'

export default function Dashboard() {
  const { data, setView, createPage, createTask } = useWorkspace()

  const recentPages = Object.values(data.pages)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)

  const pinnedPages = Object.values(data.pages).filter((p) => p.pinned)

  const todoCount = data.tasks.filter((t) => t.status === 'todo').length
  const inProgressCount = data.tasks.filter((t) => t.status === 'in_progress').length
  const doneCount = data.tasks.filter((t) => t.status === 'done').length

  const recentTasks = data.tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  }
  const priorityLabels: Record<string, string> = { high: '높음', medium: '보통', low: '낮음' }

  const statusColors: Record<string, string> = {
    todo: 'bg-neutral-100 text-neutral-600',
    in_progress: 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
  }
  const statusLabels: Record<string, string> = {
    todo: '할 일',
    in_progress: '진행중',
    done: '완료',
  }

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-4xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-neutral-400 mb-1">{today}</p>
          <h1 className="text-3xl font-bold text-neutral-900">안녕하세요 👋</h1>
          <p className="text-neutral-500 mt-1">Statfordegree Hub에 오신 것을 환영합니다.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-200 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{Object.keys(data.pages).length}</p>
                <p className="text-sm text-neutral-500">전체 페이지</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{inProgressCount}</p>
                <p className="text-sm text-blue-500">진행중인 태스크</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{doneCount}</p>
                <p className="text-sm text-green-500">완료된 태스크</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Left: Pages */}
          <div className="col-span-3 space-y-6">
            {/* Pinned pages */}
            {pinnedPages.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                  📌 고정된 페이지
                </h2>
                <div className="space-y-1">
                  {pinnedPages.map((page) => (
                    <button
                      key={page.id}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-200 text-left transition-all"
                      onClick={() => setView({ kind: 'page', pageId: page.id })}
                    >
                      <span className="text-xl">{page.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">{page.title}</p>
                        <p className="text-xs text-neutral-400">
                          {new Date(page.updatedAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Recent pages */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                  최근 페이지
                </h2>
                <button
                  className="text-xs text-blue-500 hover:text-blue-600"
                  onClick={() => {
                    const id = createPage(null)
                    setView({ kind: 'page', pageId: id })
                  }}
                >
                  + 새 페이지
                </button>
              </div>
              <div className="space-y-1">
                {recentPages.map((page) => (
                  <button
                    key={page.id}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-200 text-left transition-all"
                    onClick={() => setView({ kind: 'page', pageId: page.id })}
                  >
                    <span className="text-xl">{page.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 truncate">{page.title}</p>
                      <p className="text-xs text-neutral-400">
                        수정 {new Date(page.updatedAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Tasks */}
          <div className="col-span-2 space-y-6">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                  진행중인 태스크
                </h2>
                <button
                  className="text-xs text-blue-500 hover:text-blue-600"
                  onClick={() => setView({ kind: 'tasks' })}
                >
                  전체 보기
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                  <span>전체 진행률</span>
                  <span className="font-medium">
                    {data.tasks.length > 0 ? Math.round((doneCount / data.tasks.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full transition-all"
                    style={{
                      width: data.tasks.length > 0 ? `${(doneCount / data.tasks.length) * 100}%` : '0%',
                    }}
                  />
                </div>
                <div className="flex gap-3 mt-2 text-xs text-neutral-400">
                  <span>{todoCount} 할 일</span>
                  <span>{inProgressCount} 진행중</span>
                  <span>{doneCount} 완료</span>
                </div>
              </div>

              <div className="space-y-2">
                {recentTasks.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-neutral-400">진행중인 태스크가 없습니다</p>
                    <button
                      className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                      onClick={() => {
                        createTask()
                        setView({ kind: 'tasks' })
                      }}
                    >
                      + 태스크 추가
                    </button>
                  </div>
                )}
                {recentTasks.map((task) => (
                  <button
                    key={task.id}
                    className="w-full text-left p-3 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
                    onClick={() => setView({ kind: 'tasks' })}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-neutral-900 truncate">{task.title}</p>
                      <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                        {priorityLabels[task.priority]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors[task.status]}`}>
                        {statusLabels[task.status]}
                      </span>
                      {task.assignee && (
                        <span className="text-xs text-neutral-400">{task.assignee}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
