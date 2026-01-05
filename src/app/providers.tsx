"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { GlobalContextProvider } from "./GlobalContextProvider"
import { PageTitleProvider } from "@/contexts/PageTitleContext"
import { DevModeProvider } from "@/contexts/DevModeContext"
import { ApiStatusProvider } from "@/contexts/ApiStatusContext"
import { FeatureFlagsProvider } from "@/contexts/FeatureFlagsContext"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <GlobalContextProvider>
            <PageTitleProvider>
              <DevModeProvider>
                <FeatureFlagsProvider>
                  <ApiStatusProvider>{children}</ApiStatusProvider>
                </FeatureFlagsProvider>
              </DevModeProvider>
            </PageTitleProvider>
          </GlobalContextProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
