"use client"

import { createContext, useContext, useState, useSyncExternalStore, ReactNode } from "react"

interface FeatureFlagsContextType {
  workflowsEnabled: boolean
  setWorkflowsEnabled: (enabled: boolean) => void
  agentCommunityEnabled: boolean
  setAgentCommunityEnabled: (enabled: boolean) => void
  legacyIntegrationsEnabled: boolean
  setLegacyIntegrationsEnabled: (enabled: boolean) => void
  projectDetailsMetricsEnabled: boolean
  setProjectDetailsMetricsEnabled: (enabled: boolean) => void
  simulatorChatEnabled: boolean
  setSimulatorChatEnabled: (enabled: boolean) => void
  // Integrations display settings
  studioMinStars: number
  setStudioMinStars: (value: number) => void
  devModeMinStars: number
  setDevModeMinStars: (value: number) => void
  studioShowOthersOnFollowingPages: boolean
  setStudioShowOthersOnFollowingPages: (enabled: boolean) => void
  devModeShowOthersOnFollowingPages: boolean
  setDevModeShowOthersOnFollowingPages: (enabled: boolean) => void
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined)

// Helper functions for localStorage reading
function getStoredBoolean(key: string, defaultValue: boolean): boolean {
  if (typeof window === "undefined") return defaultValue
  const stored = localStorage.getItem(key)
  return stored !== null ? stored === "true" : defaultValue
}

function getStoredNumber(key: string, defaultValue: number): number {
  if (typeof window === "undefined") return defaultValue
  const stored = localStorage.getItem(key)
  return stored !== null ? Number(stored) : defaultValue
}

// Subscribe to storage events
function subscribeToStorage(callback: () => void): () => void {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

// Server snapshots (default values)
const serverSnapshots = {
  workflows: false,
  agentCommunity: false,
  legacyIntegrations: false,
  projectDetailsMetrics: false,
  simulatorChat: false,
  studioMinStars: 0,
  devModeMinStars: 0,
  studioShowOthers: true,
  devModeShowOthers: true,
}

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  // Use useSyncExternalStore for hydration-safe localStorage reading
  const storedWorkflows = useSyncExternalStore(
    subscribeToStorage,
    () => getStoredBoolean("featureFlags.workflowsEnabled", false),
    () => serverSnapshots.workflows
  )
  const storedAgentCommunity = useSyncExternalStore(
    subscribeToStorage,
    () => getStoredBoolean("featureFlags.agentCommunityEnabled", false),
    () => serverSnapshots.agentCommunity
  )
  const storedLegacyIntegrations = useSyncExternalStore(
    subscribeToStorage,
    () => getStoredBoolean("featureFlags.legacyIntegrationsEnabled", false),
    () => serverSnapshots.legacyIntegrations
  )
  const storedProjectDetailsMetrics = useSyncExternalStore(
    subscribeToStorage,
    () => getStoredBoolean("featureFlags.projectDetailsMetricsEnabled", false),
    () => serverSnapshots.projectDetailsMetrics
  )
  const storedSimulatorChat = useSyncExternalStore(
    subscribeToStorage,
    () => getStoredBoolean("featureFlags.simulatorChatEnabled", false),
    () => serverSnapshots.simulatorChat
  )
  const storedStudioMinStars = useSyncExternalStore(
    subscribeToStorage,
    () => getStoredNumber("featureFlags.studioMinStars", 0),
    () => serverSnapshots.studioMinStars
  )
  const storedDevModeMinStars = useSyncExternalStore(
    subscribeToStorage,
    () => getStoredNumber("featureFlags.devModeMinStars", 0),
    () => serverSnapshots.devModeMinStars
  )
  const storedStudioShowOthers = useSyncExternalStore(
    subscribeToStorage,
    () => getStoredBoolean("featureFlags.studioShowOthersOnFollowingPages", true),
    () => serverSnapshots.studioShowOthers
  )
  const storedDevModeShowOthers = useSyncExternalStore(
    subscribeToStorage,
    () => getStoredBoolean("featureFlags.devModeShowOthersOnFollowingPages", true),
    () => serverSnapshots.devModeShowOthers
  )

  const [workflowsEnabled, setWorkflowsEnabledState] = useState(storedWorkflows)
  const [agentCommunityEnabled, setAgentCommunityEnabledState] = useState(storedAgentCommunity)
  const [legacyIntegrationsEnabled, setLegacyIntegrationsEnabledState] = useState(storedLegacyIntegrations)
  const [projectDetailsMetricsEnabled, setProjectDetailsMetricsEnabledState] = useState(storedProjectDetailsMetrics)
  const [simulatorChatEnabled, setSimulatorChatEnabledState] = useState(storedSimulatorChat)
  const [studioMinStars, setStudioMinStarsState] = useState(storedStudioMinStars)
  const [devModeMinStars, setDevModeMinStarsState] = useState(storedDevModeMinStars)
  const [studioShowOthersOnFollowingPages, setStudioShowOthersOnFollowingPagesState] = useState(storedStudioShowOthers)
  const [devModeShowOthersOnFollowingPages, setDevModeShowOthersOnFollowingPagesState] = useState(storedDevModeShowOthers)

  const setWorkflowsEnabled = (enabled: boolean) => {
    setWorkflowsEnabledState(enabled)
    localStorage.setItem("featureFlags.workflowsEnabled", String(enabled))
  }

  const setAgentCommunityEnabled = (enabled: boolean) => {
    setAgentCommunityEnabledState(enabled)
    localStorage.setItem("featureFlags.agentCommunityEnabled", String(enabled))
  }

  const setLegacyIntegrationsEnabled = (enabled: boolean) => {
    setLegacyIntegrationsEnabledState(enabled)
    localStorage.setItem("featureFlags.legacyIntegrationsEnabled", String(enabled))
  }

  const setProjectDetailsMetricsEnabled = (enabled: boolean) => {
    setProjectDetailsMetricsEnabledState(enabled)
    localStorage.setItem("featureFlags.projectDetailsMetricsEnabled", String(enabled))
  }

  const setSimulatorChatEnabled = (enabled: boolean) => {
    setSimulatorChatEnabledState(enabled)
    localStorage.setItem("featureFlags.simulatorChatEnabled", String(enabled))
  }

  const setStudioMinStars = (value: number) => {
    setStudioMinStarsState(value)
    localStorage.setItem("featureFlags.studioMinStars", String(value))
  }

  const setDevModeMinStars = (value: number) => {
    setDevModeMinStarsState(value)
    localStorage.setItem("featureFlags.devModeMinStars", String(value))
  }

  const setStudioShowOthersOnFollowingPages = (enabled: boolean) => {
    setStudioShowOthersOnFollowingPagesState(enabled)
    localStorage.setItem("featureFlags.studioShowOthersOnFollowingPages", String(enabled))
  }

  const setDevModeShowOthersOnFollowingPages = (enabled: boolean) => {
    setDevModeShowOthersOnFollowingPagesState(enabled)
    localStorage.setItem("featureFlags.devModeShowOthersOnFollowingPages", String(enabled))
  }

  return (
    <FeatureFlagsContext.Provider value={{
      workflowsEnabled,
      setWorkflowsEnabled,
      agentCommunityEnabled,
      setAgentCommunityEnabled,
      legacyIntegrationsEnabled,
      setLegacyIntegrationsEnabled,
      projectDetailsMetricsEnabled,
      setProjectDetailsMetricsEnabled,
      simulatorChatEnabled,
      setSimulatorChatEnabled,
      studioMinStars,
      setStudioMinStars,
      devModeMinStars,
      setDevModeMinStars,
      studioShowOthersOnFollowingPages,
      setStudioShowOthersOnFollowingPages,
      devModeShowOthersOnFollowingPages,
      setDevModeShowOthersOnFollowingPages,
    }}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext)
  if (context === undefined) {
    throw new Error("useFeatureFlags must be used within a FeatureFlagsProvider")
  }
  return context
}

