"use client"

import { type ReactNode } from "react"

import { CollapsibleSidebar, useSidebarContext } from "@/components/CollapsibleSidebar"
import { RightSidebar } from "@/components/layout/RightSidebar"
import { RightSidebarProvider } from "@/contexts/RightSidebarContext"
import { UserMenu } from "@/components/UserMenu"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface LayoutProps {
  children: ReactNode
  fullWidth?: boolean
}

function LayoutContent({ children, fullWidth = false }: { children: ReactNode; fullWidth?: boolean }) {
  const { isOpen, setIsOpen } = useSidebarContext();

  return (
    <>
      {/* Flex container for main content area and right sidebar */}
      <div className="flex flex-1 min-w-0 h-full">
        {/* Main content area with scroll */}
        <main className={cn(
          "flex-1 min-w-0 h-full overflow-y-auto",
          fullWidth ? "p-0" : "px-4 py-4 md:px-6"
        )}>
          <div className={cn(
            "min-w-0",
            fullWidth ? "h-full" : "mr-6 h-full"
          )}>
            {children}
          </div>
        </main>

        {/* Right sidebar */}
        {!fullWidth && <RightSidebar />}
      </div>
    </>
  )
}

export function Layout({ children, fullWidth = false }: LayoutProps) {
  return (
    <RightSidebarProvider>
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
              className: "w-full footer-button",
            }}
          />
        }
      >
        <LayoutContent fullWidth={fullWidth}>{children}</LayoutContent>
      </CollapsibleSidebar>
    </RightSidebarProvider>
  )
}
