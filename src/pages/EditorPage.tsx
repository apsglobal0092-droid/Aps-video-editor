import { useEffect } from 'react'
import { useEditorStore, useUIStore } from '@/store'
import { TopBar } from '@/components/editor/TopBar'
import { PreviewArea } from '@/components/editor/PreviewArea'
import { Timeline } from '@/components/editor/Timeline'
import { ToolsPanel } from '@/components/editor/ToolsPanel'

export function EditorPage() {
  const currentProject = useEditorStore((state) => state.currentProject)
  const saveProject = useEditorStore((state) => state.saveProject)

  // Autosave every 3 seconds
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      saveProject()
    }, 3000)

    // Also save on page unload
    const handleBeforeUnload = () => {
      saveProject()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(autosaveInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [saveProject])

  if (!currentProject) {
    return null
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-950">
      {/* Top Navigation */}
      <TopBar />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 flex flex-col border-r border-slate-700">
          <PreviewArea />
        </div>

        {/* Right Sidebar Tools */}
        <ToolsPanel />
      </div>

      {/* Timeline */}
      <div className="border-t border-slate-700 bg-slate-900">
        <Timeline />
      </div>
    </div>
  )
}
