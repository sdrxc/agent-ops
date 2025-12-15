"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Monitor, Moon, Sun, LogOut } from "lucide-react"
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
import { useGlobalContext } from "@/app/GlobalContextProvider"

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
  const { user } = useGlobalContext()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const initial = user?.userName ? user.userName.charAt(0).toUpperCase() : ""

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          title={title}
          className={cn("h-10 w-10 rounded-full p-0", className)}
          {...restButtonProps}
        >
          <Avatar className="h-10 w-10 border border-border bg-primary/10 text-primary">
            <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
              {initial || "U"}
            </AvatarFallback>
          </Avatar>
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
              {user?.userName ?? "Signed in user"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.userEmail ?? ""}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.userRole ?? ""}
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
