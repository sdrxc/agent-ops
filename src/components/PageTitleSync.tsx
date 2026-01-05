"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { usePageTitle } from "@/contexts/PageTitleContext"

// Map routes to their display titles
const ROUTE_TITLES: Record<string, string> = {
  "/": "System Health",
  "/projects-directory": "Your Projects",
  "/incident-reporting": "Incident Reporting",
  "/incidents": "Incidents",
  "/cost-estimation": "Cost Estimation",
  "/agent-catalogue": "Agent Catalogue",
  "/tool-catalogue": "Tool Catalogue",
  "/server-catalogue": "Server Catalogue",
  "/user-guide": "Getting Started",
  "/project-setup": "Project Setup",
  "/agent-hosting": "Agent Hosting",
  "/logs": "Logs and Traces",
  "/assistant": "Prompt Manager",
  "/knowledge": "Knowledge",
  "/agents": "My Agents",
  "/workflows": "Workflows",
  "/simulator": "Simulator",
  "/playground": "Prompt Playground",
  "/deployments": "Deployments",
  "/mcp-registry": "MCP Registry",
  "/api-management": "API Management",
  "/agent-community": "Agent Community",
  "/dev-settings": "Developer Settings",
  "/integrations": "Integrations",
}

/**
 * Component that automatically syncs the page title based on the current route
 */
export function PageTitleSync() {
  const pathname = usePathname()
  const { setPageTitle } = usePageTitle()

  useEffect(() => {
    // Check for exact match first
    if (ROUTE_TITLES[pathname]) {
      setPageTitle(ROUTE_TITLES[pathname])
      return
    }

    // Handle dynamic routes
    if (pathname.startsWith("/projects/")) {
      setPageTitle("Project Details")
      return
    }

    if (pathname.startsWith("/projectAgentDeployment/")) {
      setPageTitle("Agent Deployment")
      return
    }

    if (pathname.startsWith("/traces/")) {
      setPageTitle("Trace Analysis")
      return
    }

    if (pathname.startsWith("/sessions/")) {
      setPageTitle("Session Details")
      return
    }

    // Fallback: Convert pathname to title
    // e.g., "/some-page" -> "Some Page"
    const fallbackTitle = pathname
      .split("/")
      .filter(Boolean)
      .map((segment) =>
        segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      )
      .join(" > ") || "Dashboard"

    setPageTitle(fallbackTitle)
  }, [pathname, setPageTitle])

  return null
}
