"use client"

import { createContext, useContext, useReducer, ReactNode } from "react"
import { incidentsReducer, initialIncidentsState } from "./incidentsReducer"
import { IncidentsState, IncidentsAction } from "../types"

interface IncidentsContextType {
  state: IncidentsState
  dispatch: React.Dispatch<IncidentsAction>
}

const IncidentsContext = createContext<IncidentsContextType | undefined>(undefined)

export function IncidentsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(incidentsReducer, initialIncidentsState)

  return (
    <IncidentsContext.Provider value={{ state, dispatch }}>
      {children}
    </IncidentsContext.Provider>
  )
}

export function useIncidents() {
  const context = useContext(IncidentsContext)
  if (context === undefined) {
    throw new Error("useIncidents must be used within an IncidentsProvider")
  }
  return context
}




