import { useEditorStore, useUIStore } from '@/store'
import { AdjustmentPanel } from './AdjustmentPanel'
import { AudioPanel } from './AudioPanel'

export function ToolsPanel() {
  const activePanel = useUIStore((state) => state.activePanel)
  const setActivePanel = useUIStore((state) => state.setActivePanel)
  const selectedClipId = useEditorStore((state) => state.selectedClipId)

  const TOOLS = [
    { id: 'adjust', label: 'Adjust', icon: 'sliders' },
    { id: 'audio', label: 'Audio', icon: 'volume' },
    { id: 'effects', label: 'Effects', icon: 'sparkles' },
    { id: 'filters', label: 'Filters', icon: 'image' },
    { id: 'text', label: 'Text', icon: 'type' },
    { id: 'overlay', label: 'Overlay', icon: 'layers' },
    { id: 'transitions', label: 'Transitions', icon: 'arrow-right' },
  ]

  const handleToolClick = (toolId: any) => {
    setActivePanel(activePanel === toolId ? null : toolId)
  }

  return (
    <div className="w-72 bg-slate-900 border-l border-slate-700 flex flex-col h-full">
      {/* Tool Buttons */}
      <div className="p-3 border-b border-slate-700 grid grid-cols-2 gap-2 bg-slate-850">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className={`p-2 rounded-lg text-xs font-medium transition ${
              activePanel === tool.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activePanel === 'adjust' && <AdjustmentPanel clipId={selectedClipId} />}
        {activePanel === 'audio' && <AudioPanel selectedClipId={selectedClipId} />}
        {!activePanel && (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm text-center px-4">
            Select a tool to get started
          </div>
        )}
        {activePanel && activePanel !== 'adjust' && activePanel !== 'audio' && (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm text-center px-4">
            {activePanel === 'effects' && 'Effects coming soon...'}
            {activePanel === 'filters' && 'Filters coming soon...'}
            {activePanel === 'text' && 'Text editor coming soon...'}
            {activePanel === 'overlay' && 'Overlays coming soon...'}
            {activePanel === 'transitions' && 'Transitions coming soon...'}
          </div>
        )}
      </div>
    </div>
  )
}
