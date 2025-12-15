"use client"

import { type CSSProperties, type ReactNode } from "react"

import { CollapsibleSidebar } from "@/components/CollapsibleSidebar"
import { DocsSidebar } from "@/components/DocsSidebar"
import { PageTitleSync } from "@/components/PageTitleSync"
import { UserMenu } from "@/components/UserMenu"
import { usePageTitle } from "@/contexts/PageTitleContext"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface LayoutProps {
  children: ReactNode
}

function TwoLineMenuIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 8h16" />
      <path d="M4 16h16" />
    </svg>
  )
}

function LayoutContent({ children }: { children: ReactNode }) {
  const { title } = usePageTitle()
  const { toggleSidebar } = useSidebar()

  return (
    <>
      <PageTitleSync />
      {/* Flex container for main content area and docs sidebar */}
      <div className="flex flex-1 min-h-0 min-w-0">
        {/* Main content area with header */}
        <div className="flex flex-1 flex-col min-h-0 min-w-0">
          {/* Header - spans only main content, not docs sidebar */}
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 bg-background px-4 md:px-6">
            <div className="flex-1">
              <h2 className="text-xs font-medium tracking-wide text-foreground">
                {title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-10 w-10"
                  aria-label="Toggle sidebar"
                >
                  <TwoLineMenuIcon className="h-5 w-5" />
                </Button>
              </div>
              <div className="hidden md:flex">
                <UserMenu />
              </div>
            </div>
          </header>

          {/* Scrollable main content */}
          <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
            {children}
          </main>
        </div>

        {/* Right docs sidebar - extends to top */}
        <DocsSidebar />
      </div>
    </>
  )
}

export function Layout({ children }: LayoutProps) {
  return (
    <CollapsibleSidebar
      userMenuTrigger={
        <UserMenu
          align="center"
          side="top"
          sideOffset={12}
          buttonProps={{
            variant: "ghost",
            size: "icon",
            title: "User menu",
          }}
        />
      }
    >
      <LayoutContent>{children}</LayoutContent>
    </CollapsibleSidebar>
  )
}
