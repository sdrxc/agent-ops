"use client";

import { createContext, useContext, useState, useSyncExternalStore, ReactNode } from "react";
import { ApiStatus } from "@/components/ApiStatusIndicator";

interface ApiStatusContextType {
  showIndicators: boolean;
  toggleIndicators: () => void;
  componentStatuses: Map<string, ApiStatus>;
  setComponentStatus: (componentName: string, status: ApiStatus) => void;
}

const ApiStatusContext = createContext<ApiStatusContextType | undefined>(
  undefined
);

// Helper to read from localStorage
function getApiStatusFromStorage(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("apiStatusIndicators");
  return stored !== null ? stored === "true" : true;
}

// Subscribe to storage events
function subscribeToStorage(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function ApiStatusProvider({ children }: { children: ReactNode }) {
  // Use useSyncExternalStore for hydration-safe localStorage reading
  const storedValue = useSyncExternalStore(
    subscribeToStorage,
    getApiStatusFromStorage,
    () => true // Server snapshot - default to showing
  );
  
  const [showIndicators, setShowIndicators] = useState(storedValue);
  const [componentStatuses, setComponentStatuses] = useState<
    Map<string, ApiStatus>
  >(new Map());

  const toggleIndicators = () => {
    setShowIndicators((prev) => {
      const newValue = !prev;
      localStorage.setItem("apiStatusIndicators", String(newValue));
      return newValue;
    });
  };

  const setComponentStatus = (componentName: string, status: ApiStatus) => {
    setComponentStatuses((prev) => {
      const newMap = new Map(prev);
      newMap.set(componentName, status);
      return newMap;
    });
  };

  return (
    <ApiStatusContext.Provider
      value={{
        showIndicators,
        toggleIndicators,
        componentStatuses,
        setComponentStatus,
      }}
    >
      {children}
    </ApiStatusContext.Provider>
  );
}

export function useApiStatus() {
  const context = useContext(ApiStatusContext);
  if (context === undefined) {
    throw new Error("useApiStatus must be used within an ApiStatusProvider");
  }
  return context;
}

