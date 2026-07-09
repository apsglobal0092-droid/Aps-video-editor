import { create } from 'zustand'
import { Project, EditorState, UIState, Timeline, ProjectSettings, VideoClip, Track } from '@/types'
import { generateId } from '@/utils/file-handler'
import { databaseService } from '@/services/database'

// ============================================
// EDITOR STORE
// ============================================

interface EditorStore extends EditorState {
  setCurrentProject: (project: Project | null) => void
  createNewProject: (name: string, width: number, height: number, fps: number) => void
  updateProject: (project: Project) => void
  saveProject: () => Promise<void>
  loadProject: (projectId: string) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  addToHistory: (project: Project) => void
  undo: () => void
  redo: () => void
  setIsPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setPlaybackSpeed: (speed: number) => void
  setZoom: (zoom: number) => void
  setSelectedTrack: (trackId: string | null) => void
  setSelectedClip: (clipId: string | null) => void

  // Clip operations
  addClipToTrack: (trackId: string, clip: VideoClip) => void
  removeClipFromTrack: (trackId: string, clipId: string) => void
  updateClipInTrack: (trackId: string, clipId: string, updates: Partial<VideoClip>) => void
  splitClipAtTime: (trackId: string, clipId: string, splitTime: number) => void
  duplicateClip: (trackId: string, clipId: string) => void
  rippleDeleteClip: (trackId: string, clipId: string) => void
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  currentProject: null,
  projects: [],
  timeline: null,
  selectedTrackId: null,
  selectedClipId: null,
  isPlaying: false,
  playbackSpeed: 1,
  currentTime: 0,
  zoom: 1,
  history: [],
  historyIndex: -1,

  setCurrentProject: (project) =>
    set({ currentProject: project, timeline: project?.timeline || null }),

  createNewProject: (name, width, height, fps) => {
    const defaultSettings: ProjectSettings = {
      outputFormat: 'mp4',
      outputQuality: 'original',
      outputResolution: 'original',
      bitrate: 5000,
      audioCodec: 'aac',
      audioSampleRate: 48000,
      preserveOriginal: true,
    }

    const newTimeline: Timeline = {
      id: `timeline-${Date.now()}`,
      duration: 0,
      tracks: [
        {
          id: 'track-video-0',
          type: 'video',
          name: 'Video',
          items: [],
          visible: true,
          locked: false,
          muted: false,
          volume: 1,
          height: 80,
        },
        {
          id: 'track-audio-0',
          type: 'audio',
          name: 'Audio',
          items: [],
          visible: true,
          locked: false,
          muted: false,
          volume: 1,
          height: 60,
        },
      ],
      currentTime: 0,
      fps,
      width,
      height,
      aspectRatio: '16:9',
    }

    const project: Project = {
      id: `project-${Date.now()}`,
      name,
      description: '',
      timeline: newTimeline,
      settings: defaultSettings,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0',
    }

    set((state) => ({
      currentProject: project,
      projects: [...state.projects, project],
      timeline: newTimeline,
      history: [project],
      historyIndex: 0,
    }))
  },

  updateProject: (project) => {
    set((state) => ({
      currentProject: project,
      projects: state.projects.map((p) => (p.id === project.id ? project : p)),
    }))
  },

  saveProject: async () => {
    const { currentProject } = get()
    if (!currentProject) return

    try {
      await databaseService.saveProject(currentProject)
    } catch (error) {
      console.error('Failed to save project:', error)
    }
  },

  loadProject: async (projectId: string) => {
    try {
      const project = await databaseService.getProject(projectId)
      if (project) {
        set({ currentProject: project, timeline: project.timeline })
      }
    } catch (error) {
      console.error('Failed to load project:', error)
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      await databaseService.deleteProject(projectId)
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
      }))
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  },

  addToHistory: (project) => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(project)
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      }
    })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      set({
        currentProject: history[newIndex],
        historyIndex: newIndex,
      })
    }
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      set({
        currentProject: history[newIndex],
        historyIndex: newIndex,
      })
    }
  },

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: Math.max(0.25, Math.min(speed, 2)) }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(zoom, 5)) }),
  setSelectedTrack: (trackId) => set({ selectedTrackId: trackId }),
  setSelectedClip: (clipId) => set({ selectedClipId: clipId }),

  // Clip operations
  addClipToTrack: (trackId, clip) => {
    set((state) => {
      if (!state.currentProject) return state

      const newProject = { ...state.currentProject }
      const track = newProject.timeline.tracks.find((t) => t.id === trackId)

      if (track && track.type === 'video') {
        track.items.push(clip)
        newProject.timeline.duration = Math.max(
          newProject.timeline.duration,
          clip.endTime
        )
        newProject.updatedAt = Date.now()
      }

      return {
        currentProject: newProject,
        timeline: newProject.timeline,
      }
    })
  },

  removeClipFromTrack: (trackId, clipId) => {
    set((state) => {
      if (!state.currentProject) return state

      const newProject = { ...state.currentProject }
      const track = newProject.timeline.tracks.find((t) => t.id === trackId)

      if (track) {
        track.items = track.items.filter((item: any) => item.id !== clipId)
        newProject.updatedAt = Date.now()
      }

      return {
        currentProject: newProject,
        timeline: newProject.timeline,
      }
    })
  },

  updateClipInTrack: (trackId, clipId, updates) => {
    set((state) => {
      if (!state.currentProject) return state

      const newProject = { ...state.currentProject }
      const track = newProject.timeline.tracks.find((t) => t.id === trackId)

      if (track) {
        const clipIndex = track.items.findIndex((item: any) => item.id === clipId)
        if (clipIndex !== -1) {
          track.items[clipIndex] = { ...track.items[clipIndex], ...updates }
          newProject.updatedAt = Date.now()
        }
      }

      return {
        currentProject: newProject,
        timeline: newProject.timeline,
      }
    })
  },

  splitClipAtTime: (trackId, clipId, splitTime) => {
    set((state) => {
      if (!state.currentProject) return state

      const newProject = { ...state.currentProject }
      const track = newProject.timeline.tracks.find((t) => t.id === trackId)

      if (track) {
        const clipIndex = track.items.findIndex((item: any) => item.id === clipId)
        if (clipIndex !== -1) {
          const clip = track.items[clipIndex] as VideoClip

          if (splitTime > clip.startTime && splitTime < clip.endTime) {
            const firstClip: VideoClip = {
              ...clip,
              id: generateId('clip'),
              endTime: splitTime,
              duration: splitTime - clip.startTime,
            }

            const secondClip: VideoClip = {
              ...clip,
              id: generateId('clip'),
              startTime: splitTime,
              duration: clip.endTime - splitTime,
            }

            track.items.splice(clipIndex, 1, firstClip, secondClip)
            newProject.updatedAt = Date.now()
          }
        }
      }

      return {
        currentProject: newProject,
        timeline: newProject.timeline,
      }
    })
  },

  duplicateClip: (trackId, clipId) => {
    set((state) => {
      if (!state.currentProject) return state

      const newProject = { ...state.currentProject }
      const track = newProject.timeline.tracks.find((t) => t.id === trackId)

      if (track) {
        const clipIndex = track.items.findIndex((item: any) => item.id === clipId)
        if (clipIndex !== -1) {
          const clip = track.items[clipIndex] as VideoClip
          const duration = clip.endTime - clip.startTime
          const duplicatedClip: VideoClip = {
            ...clip,
            id: generateId('clip'),
            startTime: clip.endTime,
            endTime: clip.endTime + duration,
          }
          track.items.push(duplicatedClip)
          newProject.timeline.duration = Math.max(
            newProject.timeline.duration,
            duplicatedClip.endTime
          )
          newProject.updatedAt = Date.now()
        }
      }

      return {
        currentProject: newProject,
        timeline: newProject.timeline,
      }
    })
  },

  rippleDeleteClip: (trackId, clipId) => {
    set((state) => {
      if (!state.currentProject) return state

      const newProject = { ...state.currentProject }
      const track = newProject.timeline.tracks.find((t) => t.id === trackId)

      if (track) {
        const clipIndex = track.items.findIndex((item: any) => item.id === clipId)
        if (clipIndex !== -1) {
          const clip = track.items[clipIndex] as VideoClip
          const duration = clip.endTime - clip.startTime

          // Remove the clip
          track.items.splice(clipIndex, 1)

          // Shift subsequent clips
          for (let i = clipIndex; i < track.items.length; i++) {
            const item = track.items[i] as any
            item.startTime -= duration
            item.endTime -= duration
          }

          newProject.updatedAt = Date.now()
        }
      }

      return {
        currentProject: newProject,
        timeline: newProject.timeline,
      }
    })
  },
}))

// ============================================
// UI STORE
// ============================================

interface UIStoreType extends UIState {
  setShowPreview: (show: boolean) => void
  setShowTimeline: (show: boolean) => void
  setSidebarOpen: (open: boolean) => void
  setActivePanel: (
    panel: 'adjust' | 'effects' | 'filters' | 'audio' | 'text' | 'overlay' | 'transitions' | null
  ) => void
  setIsDarkMode: (dark: boolean) => void
  setPreviewAspectRatio: (ratio: '16:9' | '9:16' | '1:1' | '4:3') => void
  setPreviewFullscreen: (fullscreen: boolean) => void
}

export const useUIStore = create<UIStoreType>((set) => ({
  showPreview: true,
  showTimeline: true,
  sidebarOpen: true,
  activePanel: null,
  isDarkMode: true,
  previewAspectRatio: '16:9',
  previewFullscreen: false,

  setShowPreview: (show) => set({ showPreview: show }),
  setShowTimeline: (show) => set({ showTimeline: show }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setIsDarkMode: (dark) => set({ isDarkMode: dark }),
  setPreviewAspectRatio: (ratio) => set({ previewAspectRatio: ratio }),
  setPreviewFullscreen: (fullscreen) => set({ previewFullscreen: fullscreen }),
}))
