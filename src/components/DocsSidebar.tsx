"use client"

import { useState } from "react"
import { Book, X, House } from "lucide-react"

import { DocsContent } from "@/components/DocsContent"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function DocsSidebar() {
  const [expanded, setExpanded] = useState(false)

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 border-l border-border bg-background transition-[width] duration-200 ease-linear lg:flex lg:flex-col",
        expanded ? "w-[22rem]" : "w-12"
      )}
    >
      <div className="flex h-full w-full flex-col">
        {/* Toggle button centered vertically - only show when collapsed */}
        {!expanded && (
          <div className="flex h-full w-full shrink-0 items-center justify-center px-2 transition-colors">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setExpanded(true)}
              className="rotate-90 text-foreground transition hover:text-foreground"
              aria-label="Expand docs sidebar"
              title="Expand docs sidebar"
            >
              <Book className="mr-2 size-5 -rotate-90" />
              <span>Docs</span>
            </Button>
          </div>
        )}

        {/* Expandable content with fixed height and internal scrolling */}
        {expanded && (
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                aria-label="Home"
                title="Home"
              >
                <House className="size-5" />
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(false)}
                className="h-7 w-7 text-foreground transition hover:text-foreground"
                aria-label="Close docs sidebar"
                title="Close docs sidebar"
              >
                <X className="size-4" />
              </Button>
            </div>
            {/* Scrollable docs content */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <DocsContent />
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
