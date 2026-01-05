"use client"

import { useCallback, useMemo, useState, useContext, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Monitor, Moon, Sun, LogOut, Settings } from "lucide-react"
import { useTheme } from "next-themes"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
// import { useGlobalContext } from "@/app/GlobalContextProvider"
import { useSessionUser } from "@/hooks/useSessionUser"
import { SidebarContext } from "@/components/CollapsibleSidebar"

interface UserMenuProps {
  buttonProps?: React.ComponentProps<typeof Button>
  align?: React.ComponentProps<typeof DropdownMenuContent>["align"]
  side?: React.ComponentProps<typeof DropdownMenuContent>["side"]
  sideOffset?: number
  contentClassName?: string
}

const THEME_VALUES = ["light", "dark", "system"] as const
type ThemeOption = (typeof THEME_VALUES)[number]

export function UserMenu({
  buttonProps,
  align = "end",
  side,
  sideOffset,
  contentClassName,
}: UserMenuProps) {
  const router = useRouter()
  // const { user } = useGlobalContext()
  const {email, name, role } = useSessionUser()
  
  const { theme, setTheme } = useTheme()
  
  // Hydration-safe mounted check using useSyncExternalStore
  const mounted = useSyncExternalStore(
    () => () => {}, // No subscription needed
    () => true,     // Client: always mounted
    () => false     // Server: not mounted
  )
  
  // Get sidebar state if available (for footer button)
  const sidebarContext = useContext(SidebarContext)
  const isSidebarOpen = sidebarContext?.isOpen ?? true

  const handleLogout = useCallback(async () => {
    try {
      await signOut({
        redirect: false,
        callbackUrl: "/auth/login",
      })
      localStorage.clear()
      sessionStorage.clear()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }, [router])

  const initial = name ? name.charAt(0).toUpperCase() : ""

  const {
    className,
    variant = "ghost",
    size = "icon",
    title = "User menu",
    ...restButtonProps
  } = buttonProps ?? {}

  const activeTheme: ThemeOption = useMemo(() => {
    if (!mounted) {
      return "system"
    }
    return THEME_VALUES.includes(theme as ThemeOption)
      ? (theme as ThemeOption)
      : "system"
  }, [mounted, theme])

  const handleThemeChange = useCallback(
    (value: ThemeOption | "") => {
      if (!value) {
        return
      }
      setTheme(value)
    },
    [setTheme]
  )

  // Check if this is a full-width footer button
  const isFullWidth = className?.includes("w-full") || className?.includes("footer-button")
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          title={title}
          className={cn(
            isFullWidth 
              ? "w-full h-auto p-2 justify-start text-left" 
              : "h-10 w-10 rounded-full p-0",
            className
          )}
          {...restButtonProps}
        >
          <Avatar className={cn(
            "border border-border bg-primary/10 text-primary shrink-0",
            isFullWidth ? "h-8 w-8" : "h-10 w-10"
          )}>
            <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
              {initial || "U"}
            </AvatarFallback>
          </Avatar>
          {isFullWidth && isSidebarOpen && (
            <div className="flex flex-col items-start overflow-hidden text-sm ml-2 min-w-0 flex-1 transition-all duration-300 text-left">
              <span className="font-medium truncate w-full text-left">
                {name ?? "Signed in user"}
              </span>
              <span className="text-muted-foreground text-xs truncate w-full text-left">
                {role ?? email ?? ""}
              </span>
            </div>
          )}
          <span className="sr-only">Open user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn("w-64 p-0", contentClassName)}
      >
        <div className="flex items-center gap-3 p-4">
          <Avatar className="h-10 w-10 border border-border bg-primary/10 text-primary">
            <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
              {initial || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {name ?? "Signed in user"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {email ?? ""}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {role ?? ""}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-4 pb-2 pt-3 text-xs font-medium uppercase text-muted-foreground">
          Theme
        </DropdownMenuLabel>
        <div className="px-4 pb-4">
          <ToggleGroup
            type="single"
            value={activeTheme}
            onValueChange={handleThemeChange}
            className="inline-flex gap-1 rounded-full bg-muted p-1"
          >
            <ToggleGroupItem
              value="light"
              aria-label="Use light theme"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all data-[state=on]:bg-background data-[state=on]:text-foreground"
            >
              <Sun className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="dark"
              aria-label="Use dark theme"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all data-[state=on]:bg-background data-[state=on]:text-foreground"
            >
              <Moon className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="system"
              aria-label="Use system theme"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all data-[state=on]:bg-background data-[state=on]:text-foreground"
            >
              <Monitor className="h-5 w-5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            router.push("/dev-settings")
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          Dev Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-4 py-2 text-xs uppercase text-muted-foreground">
          Account
        </DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            handleLogout()
          }}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
