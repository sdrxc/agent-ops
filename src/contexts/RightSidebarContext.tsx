"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface RightSidebarContextType {
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  width: string // "3rem" when collapsed, "20rem" when expanded
}

const RightSidebarContext = createContext<RightSidebarContextType | null>(null)

export function RightSidebarProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false)
  const width = expanded ? "20rem" : "3rem"
  
  return (
    <RightSidebarContext.Provider value={{ expanded, setExpanded, width }}>
      {children}
    </RightSidebarContext.Provider>
  )
}

export function useRightSidebar() {
  const context = useContext(RightSidebarContext)
  if (!context) {
    throw new Error("useRightSidebar must be used within RightSidebarProvider")
  }
  return context
}





