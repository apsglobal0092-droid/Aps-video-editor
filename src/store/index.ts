/**
 * Zustand Store Configuration
 * Centralized state management for the entire application
 */

import { create } from 'zustand'
import { Project, EditorState, UIState, Timeline, ProjectSettings } from '@types/index'

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
      outputQuality: 'high',
      outputResolution: '1080p',
      bitrate: 5000,
      audioCodec: 'aac',
      audioSampleRate: 48000,
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
      const db = await openIndexedDB()
      const tx = db.transaction(['projects'], 'readwrite')
      const store = tx.objectStore('projects')
      await store.put(currentProject)
    } catch (error) {
      console.error('Failed to save project:', error)
    }
  },

  loadProject: async (projectId: string) => {
    try {
      const db = await openIndexedDB()
      const tx = db.transaction(['projects'], 'readonly')
      const store = tx.objectStore('projects')
      const request = store.get(projectId)
      const project = await new Promise<Project>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      set({ currentProject: project, timeline: project.timeline })
    } catch (error) {
      console.error('Failed to load project:', error)
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      const db = await openIndexedDB()
      const tx = db.transaction(['projects'], 'readwrite')
      const store = tx.objectStore('projects')
      await store.delete(projectId)
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
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(zoom, 5)) }),
  setSelectedTrack: (trackId) => set({ selectedTrackId: trackId }),
  setSelectedClip: (clipId) => set({ selectedClipId: clipId }),
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

// ============================================
// INDEXEDDB HELPERS
// ============================================

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('APSVideoEditor', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' })
      }
    }
  })
}
