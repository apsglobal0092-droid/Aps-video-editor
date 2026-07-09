import { useEditorStore } from '@/store'
import { downloadFile } from '@/utils/file-handler'

export function TopBar() {
  const currentProject = useEditorStore((state) => state.currentProject)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const saveProject = useEditorStore((state) => state.saveProject)
  const historyIndex = useEditorStore((state) => state.historyIndex)
  const history = useEditorStore((state) => state.history)

  const handleExport = () => {
    // Placeholder for export
    alert('Export functionality coming soon')
  }

  return (
    <div className="h-16 border-b border-slate-700 bg-slate-900 flex items-center justify-between px-6">
      {/* Left: Project Name */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-white">{currentProject?.name}</h2>
      </div>

      {/* Center: History Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="Undo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6-6m-6 6l-6 6"
            />
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="Redo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 10h-10a8 8 0 00-8 8v2m0 0l-6 6m6-6l6 6"
            />
          </svg>
        </button>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={saveProject}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition text-sm"
        >
          Save
        </button>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
        >
          Export
        </button>
      </div>
    </div>
  )
}
