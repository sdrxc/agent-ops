"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

type UserDetails = {
  userID: string;
  userName: string;
  userEmail: string;
  userRole: string;
  sessionId: string;
  orgId: string;
  accessDetails: Record<string, any>; // or a more specific type if you know the shape
};

type GlobalContextType = {
  user: UserDetails | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
const isLocalEnv = runtimeEnv === "local";

export const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // fetch user details from API
  const fetchUserDetails = async (): Promise<void> => {
    try {
      setLoading(true);

      const apiUrl = isLocalEnv ? `${baseURL}/api/listProjects` : `/api/listProjects`;

      // Uncomment this block when API is ready
      /*
      const email = "testuser@pharma.com";
      const response = await axios.post(apiUrl, {
        userEmail: email,
      });
      console.log("user-details", response);
      // The API returns the data directly, not nested under data.data
      setUser(response.data);
      */

      // BYPASSING for the time being
      const userData: UserDetails = {
        userID: "usr-100000",
        userName: "Bayer Test User",
        userEmail: "testuser@bayer.com",
        userRole: "admin",
        sessionId: "session-id-0070-24242-4234", // fixed typo
        orgId: "bayer-01",
        accessDetails: {},
      };

      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        user,
        loading,
        refreshUser: fetchUserDetails,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

// ✅ custom hook for easy usage
export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used inside GlobalContextProvider");
  }
  return context;
};
