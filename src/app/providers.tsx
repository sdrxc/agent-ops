"use client"

import { ThemeProvider } from "next-themes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { GlobalContextProvider } from "./GlobalContextProvider"
import { PageTitleProvider } from "@/contexts/PageTitleContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <GlobalContextProvider>
          <PageTitleProvider>{children}</PageTitleProvider>
        </GlobalContextProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
