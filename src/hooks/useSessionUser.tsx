"use client";

import { useSyncExternalStore } from "react";

interface SessionUser {
  email: string | null;
  name: string | null;
  user_type: string | null;
  role: string | null;
  userid: string | null;
}

// Cached snapshot to maintain referential equality
let cachedSnapshot: SessionUser | null = null;
let cachedValues: string | null = null;

// Helper to safely read from sessionStorage (SSR-safe)
function getSessionUser(): SessionUser {
  if (typeof window === "undefined") {
    const serverSnapshot: SessionUser = { 
      email: null, 
      name: null, 
      user_type: null, 
      role: null, 
      userid: null 
    };
    return serverSnapshot;
  }

  // Read values from sessionStorage
  const email = sessionStorage.getItem("email");
  const name = sessionStorage.getItem("user_name");
  const user_type = sessionStorage.getItem("user_type");
  const role = sessionStorage.getItem("role");
  const userid = sessionStorage.getItem("userid");

  // Create a string key to compare values
  const valuesKey = `${email}|${name}|${user_type}|${role}|${userid}`;

  // Return cached snapshot if values haven't changed
  if (cachedSnapshot && cachedValues === valuesKey) {
    return cachedSnapshot;
  }

  // Create new snapshot and cache it
  const newSnapshot: SessionUser = {
    email,
    name,
    user_type,
    role,
    userid,
  };

  cachedSnapshot = newSnapshot;
  cachedValues = valuesKey;

  return newSnapshot;
}

// Server snapshot (empty user) - stable reference
const serverSnapshot: SessionUser = { 
  email: null, 
  name: null, 
  user_type: null, 
  role: null, 
  userid: null 
};

function getServerSnapshot(): SessionUser {
  return serverSnapshot;
}

// Subscribe to storage events
function subscribeToStorage(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  
  // Listen to storage events and also poll for changes (since storage events
  // only fire in other tabs/windows, not the current one)
  const handleStorageChange = () => {
    // Clear cache to force re-read
    cachedSnapshot = null;
    cachedValues = null;
    callback();
  };

  window.addEventListener("storage", handleStorageChange);
  
  // Also listen to custom events that can be dispatched when sessionStorage
  // is updated programmatically in the same window
  window.addEventListener("sessionStorageChange", handleStorageChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("sessionStorageChange", handleStorageChange);
  };
}

export function useSessionUser() {
  // Use useSyncExternalStore for hydration-safe sessionStorage reading
  const user = useSyncExternalStore(
    subscribeToStorage,
    getSessionUser,
    getServerSnapshot
  );

  return user;
}
