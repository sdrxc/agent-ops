export interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface ProjectsState {
  projects: Project[]
  loading: boolean
  error: string | null
  selectedProject: Project | null
}

export type ProjectsAction =
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SELECT_PROJECT'; payload: Project | null }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }




