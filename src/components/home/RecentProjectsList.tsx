import { useEffect, useState } from 'react'
import { databaseService } from '@/services/database'
import { Project } from '@/types'
import { formatDuration } from '@/utils/file-handler'

interface RecentProjectsListProps {
  onProjectSelect: (projectId: string) => void
}

export function RecentProjectsList({ onProjectSelect }: RecentProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const allProjects = await databaseService.getAllProjects()
        setProjects(allProjects.slice(0, 6)) // Show 6 most recent
      } catch (error) {
        console.error('Failed to load projects:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-400">Loading projects...</div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No projects yet. Create your first project to get started!</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Recent Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onProjectSelect(project.id)}
            className="glass-lg p-4 cursor-pointer hover:bg-slate-800/50 transition group"
          >
            <div className="mb-4 bg-slate-800 rounded-lg h-32 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-12 h-12 mx-auto text-slate-500 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs text-slate-500">Project</p>
              </div>
            </div>
            <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition">
              {project.name}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {formatDuration(project.timeline.duration)}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Updated {new Date(project.updatedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
