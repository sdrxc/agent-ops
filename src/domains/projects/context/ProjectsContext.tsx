"use client"

import { createContext, useContext, useReducer, ReactNode } from "react"
import { projectsReducer, initialProjectsState } from "./projectsReducer"
import { ProjectsState, ProjectsAction } from "../types"

interface ProjectsContextType {
  state: ProjectsState
  dispatch: React.Dispatch<ProjectsAction>
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectsReducer, initialProjectsState)

  return (
    <ProjectsContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider")
  }
  return context
}




