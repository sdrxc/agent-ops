import { ProjectsState, ProjectsAction } from "../types"

export const initialProjectsState: ProjectsState = {
  projects: [],
  loading: false,
  error: null,
  selectedProject: null,
}

export function projectsReducer(
  state: ProjectsState,
  action: ProjectsAction
): ProjectsState {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, loading: false, error: null }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SELECT_PROJECT':
      return { ...state, selectedProject: action.payload }
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] }
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.id ? action.payload : project
        ),
      }
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((project) => project.id !== action.payload),
        selectedProject:
          state.selectedProject?.id === action.payload ? null : state.selectedProject,
      }
    default:
      return state
  }
}




