'use client'

import React, { useEffect } from 'react'
import { WorkspaceProvider, useWorkspace } from '@/lib/WorkspaceContext'
import Sidebar from './Sidebar'
import Dashboard from './Dashboard'
import PageEditor from './PageEditor'
import TaskBoard from './TaskBoard'

function WorkspaceInner() {
  const { view, data, setView } = useWorkspace()

  // If viewing a page that was deleted, go to dashboard
  useEffect(() => {
    if (view.kind === 'page' && !data.pages[view.pageId]) {
      setView({ kind: 'dashboard' })
    }
  }, [view, data.pages, setView])

  const renderMain = () => {
    if (view.kind === 'dashboard') return <Dashboard />
    if (view.kind === 'tasks') return <TaskBoard />
    if (view.kind === 'page') return <PageEditor pageId={view.pageId} />
    return <Dashboard />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      {renderMain()}
    </div>
  )
}

export default function Workspace() {
  return (
    <WorkspaceProvider>
      <WorkspaceInner />
    </WorkspaceProvider>
  )
}
