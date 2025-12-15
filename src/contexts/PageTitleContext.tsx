"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface PageTitleContextType {
  title: string
  subtitle: string
  setTitle: (title: string) => void
  setSubtitle: (subtitle: string) => void
  setPageTitle: (title: string, subtitle?: string) => void
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined)

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string>("Dashboard")
  const [subtitle, setSubtitle] = useState<string>("")

  const setPageTitle = (newTitle: string, newSubtitle: string = "") => {
    setTitle(newTitle)
    setSubtitle(newSubtitle)
  }

  return (
    <PageTitleContext.Provider
      value={{
        title,
        subtitle,
        setTitle,
        setSubtitle,
        setPageTitle,
      }}
    >
      {children}
    </PageTitleContext.Provider>
  )
}

export function usePageTitle() {
  const context = useContext(PageTitleContext)
  if (context === undefined) {
    throw new Error("usePageTitle must be used within a PageTitleProvider")
  }
  return context
}
