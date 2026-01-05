"use client"

import { createContext, useContext, useState, useSyncExternalStore, ReactNode, useCallback } from "react"

interface DevModeContextType {
  isDevMode: boolean
  toggleDevMode: () => void
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined)

// Helper to read devMode from localStorage
function getDevModeFromStorage(): boolean {
  if (typeof window === "undefined") return false
  const stored = localStorage.getItem("devMode")
  return stored === "true"
}

// Subscribe to storage events
function subscribeToStorage(callback: () => void): () => void {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

export function DevModeProvider({ children }: { children: ReactNode }) {
  // Use useSyncExternalStore for hydration-safe localStorage reading
  const storedValue = useSyncExternalStore(
    subscribeToStorage,
    getDevModeFromStorage,
    () => false // Server snapshot
  )
  
  const [isDevMode, setIsDevMode] = useState(storedValue)

  const toggleDevMode = () => {
    setIsDevMode((prev) => {
      const newValue = !prev
      localStorage.setItem("devMode", String(newValue))
      return newValue
    })
  }

  return (
    <DevModeContext.Provider value={{ isDevMode, toggleDevMode }}>
      {children}
    </DevModeContext.Provider>
  )
}

export function useDevMode() {
  const context = useContext(DevModeContext)
  if (context === undefined) {
    throw new Error("useDevMode must be used within a DevModeProvider")
  }
  return context
}




