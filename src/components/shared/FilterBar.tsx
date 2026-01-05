"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FilterBarProps {
  children: ReactNode
  className?: string
}

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-lg border",
        className
      )}
    >
      {children}
    </div>
  )
}




