"use client"

import { createContext, useContext, useReducer, ReactNode } from "react"
import { agentsReducer, initialAgentsState } from "./agentsReducer"
import { AgentsState, AgentsAction } from "../types"

interface AgentsContextType {
  state: AgentsState
  dispatch: React.Dispatch<AgentsAction>
}

const AgentsContext = createContext<AgentsContextType | undefined>(undefined)

export function AgentsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(agentsReducer, initialAgentsState)

  return (
    <AgentsContext.Provider value={{ state, dispatch }}>
      {children}
    </AgentsContext.Provider>
  )
}

export function useAgents() {
  const context = useContext(AgentsContext)
  if (context === undefined) {
    throw new Error("useAgents must be used within an AgentsProvider")
  }
  return context
}




