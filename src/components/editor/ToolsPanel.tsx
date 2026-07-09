import { useUIStore } from '@/store'

type PanelType = 'adjust' | 'effects' | 'filters' | 'audio' | 'text' | 'overlay' | 'transitions' | null

const TOOLS = [
  { id: 'adjust', label: 'Adjust', icon: 'sliders' },
  { id: 'effects', label: 'Effects', icon: 'sparkles' },
  { id: 'filters', label: 'Filters', icon: 'image' },
  { id: 'audio', label: 'Audio', icon: 'volume' },
  { id: 'text', label: 'Text', icon: 'type' },
  { id: 'overlay', label: 'Overlay', icon: 'layers' },
  { id: 'transitions', label: 'Transitions', icon: 'arrow-right' },
]

export function ToolsPanel() {
  const activePanel = useUIStore((state) => state.activePanel)
  const setActivePanel = useUIStore((state) => state.setActivePanel)

  const handleToolClick = (toolId: PanelType) => {
    setActivePanel(activePanel === toolId ? null : toolId)
  }

  return (
    <div className="w-64 bg-slate-900 border-l border-slate-700 flex flex-col">
      {/* Tool Buttons */}
      <div className="p-4 border-b border-slate-700 grid grid-cols-2 gap-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id as PanelType)}
            className={`p-3 rounded-lg text-xs font-medium transition ${
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
      <div className="flex-1 overflow-y-auto p-4">
        {activePanel ? (
          <div className="text-slate-400 text-sm">
            <p className="font-medium text-white mb-2">{getToolName(activePanel)} Settings</p>
            <p className="text-xs">Coming soon...</p>
          </div>
        ) : (
          <div className="text-center text-slate-500 text-sm mt-8">
            <p>Select a tool to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

function getToolName(tool: PanelType): string {
  const names: Record<string, string> = {
    adjust: 'Adjust',
    effects: 'Effects',
    filters: 'Filters',
    audio: 'Audio',
    text: 'Text',
    overlay: 'Overlay',
    transitions: 'Transitions',
  }
  return names[tool] || 'Tools'
}
