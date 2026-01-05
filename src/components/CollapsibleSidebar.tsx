"use client";

import {
  type ReactNode,
  useState,
  createContext,
  useContext,
  useSyncExternalStore,
} from "react";

import {
  Bot,
  Wrench,
  Code,
  Server,
  Database,
  Siren,
  Play,
  Layers,
  Box,
  FilePenLine,
  Globe,
  LayoutDashboard,
  LayoutTemplate,
  FileText,
  PanelLeft,
  Lock,
} from "lucide-react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { useDevMode } from "@/contexts/DevModeContext";

import { useApiStatus } from "@/contexts/ApiStatusContext";

import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";

import { ApiStatusIndicator, ApiStatus } from "@/components/ApiStatusIndicator";

import { getComponentApiStatus } from "@/lib/api-status";

import { Workflow, Smartphone, BookOpen, Puzzle } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";

import { useSessionUser } from "@/hooks/useSessionUser";

interface CollapsibleSidebarProps {
  userMenuTrigger?: ReactNode;

  children: ReactNode;
}

interface SidebarContextType {
  isOpen: boolean;

  setIsOpen: (open: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebarContext() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebarContext must be used within CollapsibleSidebar");
  }

  return context;
}

// const SIDEBAR_GROUPS = {

// Create: [

// {

// id: "projects-directory",

// label: "Your Projects",

// icon: Rocket,

// href: "/projects-directory",

// },

// ],

// Manage: [

// {

// id: "agenthub",

// label: "AgentHub",

// icon: Home,

// href: "/",

// },

// {

// id: "incident-reporting",

// label: "Incident Reporting",

// icon: AlertTriangle,

// href: "/incident-reporting",

// },

// {

// id: "cost-estimation",

// label: "Cost Estimation",

// icon: DollarSign,

// href: "/cost-estimation",

// },

// ],

// Optimize: [

// {

// id: "agent-catalogue",

// label: "Agent Catalogue",

// icon: Bot,

// href: "/agent-catalogue",

// },

// {

// id: "tool-catalogue",

// label: "Tool Catalogue",

// icon: Wrench,

// href: "/tool-catalogue",

// },

// {

// id: "server-catalogue",

// label: "Server Catalogue",

// icon: Server,

// href: "/server-catalogue",

// },

// {

// id: "user-guide",

// label: "User Guide",

// icon: Book,

// href: "/user-guide",

// },

// ],

// } as const;

const SIDEBAR_GROUPS = {
  Performance: [
    {
      id: "overview",

      label: "System Health",

      icon: LayoutDashboard,

      href: "/",

      apiStatus: "full" as ApiStatus,
    },

    {
      id: "logs",

      label: "Logs and Traces",

      icon: FileText,

      href: "/logs",

      apiStatus: "none" as ApiStatus,
    },
  ],

  Studio: [
    {
      id: "assistant",

      label: "Prompt Manager",

      icon: FilePenLine,

      href: "/assistant",

      apiStatus: "none" as ApiStatus,
    },

    {
      id: "agents",

      label: "My Agents",

      icon: Bot,

      href: "/agents",

      apiStatus: "full" as ApiStatus,
    },

    {
      id: "workflows",

      label: "Workflows",

      icon: Workflow,

      href: "/workflows",

      apiStatus: "none" as ApiStatus,
    },

    {
      id: "simulator",

      label: "Simulator",

      icon: Smartphone,

      href: "/simulator",

      apiStatus: "none" as ApiStatus,
    },

    {
      id: "knowledge",

      label: "Knowledge",

      icon: BookOpen,

      href: "/knowledge",

      apiStatus: "none" as ApiStatus,
    },

    {
      id: "integrations",

      label: "Integrations",

      icon: Puzzle,

      href: "/integrations",

      apiStatus: "partial" as ApiStatus,
    },
  ],

  Discover: [
    {
      id: "getting-started",

      label: "Getting Started",

      icon: BookOpen,

      href: "/user-guide",

      apiStatus: "none" as ApiStatus,
    },

    {
      id: "agent-community",

      label: "Agent Community",

      icon: Globe,

      href: "/agent-community",

      apiStatus: "full" as ApiStatus,
    },
  ],
} as const;

const DEV_TOOLS_ITEMS = [
  {
    id: "data-explorer",

    label: "Query Console",

    icon: Database,

    href: "/data-explorer",

    apiStatus: "partial" as ApiStatus,
  },

  {
    id: "incidents",

    label: "Incidents",

    icon: Siren,

    href: "/incidents",

    apiStatus: "partial" as ApiStatus,
  },

  {
    id: "playground",

    label: "Playground",

    icon: Play,

    href: "/playground",

    apiStatus: "partial" as ApiStatus,
  },

  {
    id: "deployments",

    label: "Deployments",

    icon: Layers,

    href: "/deployments",

    apiStatus: "full" as ApiStatus,
  },

  {
    id: "api-management",

    label: "API Management",

    icon: Server,

    href: "/api-management",

    apiStatus: "none" as ApiStatus,
  },
] as const;

function AppSidebar({
  isOpen,

  setIsOpen,

  userMenuTrigger,
}: {
  isOpen: boolean;

  setIsOpen: (open: boolean) => void;

  userMenuTrigger?: ReactNode;
}) {
  const pathname = usePathname();

  const { isDevMode, toggleDevMode } = useDevMode();

  const { showIndicators } = useApiStatus();

  const { workflowsEnabled, agentCommunityEnabled } = useFeatureFlags();

  const { name, email, role } = useSessionUser();

  // Only show API indicators in DevMode

  const shouldShowIndicators = showIndicators && isDevMode;

  const initial = name ? name.charAt(0).toUpperCase() : "";

  return (
    <aside
      className={cn(
        "group relative flex flex-col bg-muted/10 border-r h-full transition-all duration-300 ease-in-out",

        isOpen ? "w-[260px]" : "w-[60px]"
      )}
    >
      {/* SCROLL CONTAINER */}

      <div
        className={cn(
          "flex-1 pr-0 overflow-x-hidden overflow-y-auto",
          !isOpen &&
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {/* STICKY HEADER INSIDE SCROLL AREA */}

        <div
          className={cn(
            "top-0 z-10 sticky bg-muted/10 backdrop-blur-sm pt-3 pr-0 pb-1",
            isOpen ? "pl-2" : "px-0"
          )}
        >
          <div
            className={cn(
              "flex items-center h-10 transition-all duration-300",

              isOpen ? "justify-between px-2" : "justify-center"
            )}
          >
            {/* Logo & Text Wrapper */}

            <div className="flex items-center overflow-hidden">
              <div className="flex justify-center items-center bg-background rounded-lg w-10 h-10 shrink-0 overflow-hidden">
                <video
                  src="/torus_knot_96px.webm"
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>

              <div
                className={cn(
                  "flex flex-col items-start overflow-hidden text-sm transition-all duration-300",

                  isOpen
                    ? "w-auto ml-2 opacity-100"
                    : "w-0 ml-0 opacity-0 hidden"
                )}
              >
                <span className="font-semibold whitespace-nowrap">
                  Agentrix
                </span>

                <span className="text-muted-foreground text-xs whitespace-nowrap">
                  AI Management
                </span>
              </div>
            </div>

            {/* Toggle Button */}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "w-8 h-8 text-muted-foreground transition-opacity cursor-ew-resize",

                isOpen
                  ? "opacity-100"
                  : "absolute left-1/2 -translate-x-1/2 top-4 opacity-0 group-hover:opacity-100"
              )}
            >
              <PanelLeft className="w-4 h-4" />

              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}

        <div
          className={cn(
            "space-y-2 py-2",
            isOpen ? "pl-2 pr-0" : "px-0"
          )}
        >
          {/* DevMode Toggle */}

          {isOpen && (
            <div className="mb-4 px-2">
              <div className="flex bg-muted/30 p-1 border border-border/50 rounded-lg">
                {/* LEFT SIDE: STUDIO (Build + Ops) */}
                <button
                  onClick={() => isDevMode && toggleDevMode()}
                  className={cn(
                    "flex flex-1 justify-center items-center gap-2 py-1.5 rounded-md font-medium text-xs transition-all duration-200",
                    !isDevMode
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <LayoutTemplate className="w-3.5 h-3.5" />
                  Studio
                </button>

                {/* RIGHT SIDE: DEV (Technical/Deep Dive) */}
                <button
                  onClick={() => !isDevMode && toggleDevMode()}
                  className={cn(
                    "flex flex-1 justify-center items-center gap-2 py-1.5 rounded-md font-medium text-xs transition-all duration-200",
                    isDevMode
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Code className="w-3.5 h-3.5" />
                  Dev
                </button>
              </div>
            </div>
          )}

          {/* Developer Tools - Only shown when DevMode is enabled (Moved before normal groups) */}
          {/* REMOVED: Developer Tools will be rendered inside the map to control order */}

          {/* Sidebar Groups */}

          {(
            Object.keys(SIDEBAR_GROUPS) as Array<keyof typeof SIDEBAR_GROUPS>
          ).map((groupName) => {
            // Logic to insert Developer Tools before "Discover" group
            if (isDevMode && groupName === "Discover") {
              return (
                <div key="dev-tools-wrapper">
                  <div className="space-y-2 mb-4">
                    <div
                      className={cn(
                        "mb-2 px-2 overflow-hidden font-medium text-muted-foreground text-xs transition-all duration-300",

                        isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
                      )}
                    >
                      Developer Tools
                    </div>

                    <div className="space-y-2">
                      {DEV_TOOLS_ITEMS.map((item) => {
                        const IconComponent = item.icon;

                        const isActive = pathname === item.href;

                        const apiStatusInfo = getComponentApiStatus(item.id);

                        const status =
                          item.apiStatus || apiStatusInfo?.status || "none";

                        return (
                          <Button
                            key={item.id}
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                              "h-10 transition-all duration-300",

                              isOpen
                                ? "w-full justify-start px-2"
                                : "w-10 justify-center px-0 mx-auto",

                              isActive && "bg-accent"
                            )}
                            asChild
                            title={!isOpen ? item.label : undefined}
                          >
                            <Link
                              href={item.href}
                              className={cn(
                                "flex items-center w-full",

                                isOpen ? "justify-between" : "justify-center"
                              )}
                            >
                              <div
                                className={cn(
                                  "flex items-center",

                                  isOpen ? "flex-1 min-w-0" : ""
                                )}
                              >
                                <IconComponent className="w-5 h-5 shrink-0" />

                                <span
                                  className={cn(
                                    "overflow-hidden whitespace-nowrap transition-all duration-300",

                                    isOpen
                                      ? "w-auto ml-2 opacity-100"
                                      : "w-0 ml-0 opacity-0"
                                  )}
                                >
                                  {item.label}
                                </span>
                              </div>

                              {isOpen && shouldShowIndicators && (
                                <div className="ml-2 shrink-0">
                                  <ApiStatusIndicator
                                    status={status}
                                    componentName={apiStatusInfo?.componentName}
                                    endpoints={apiStatusInfo?.endpoints}
                                  />
                                </div>
                              )}
                            </Link>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div
                      className={cn(
                        "mb-2 px-2 overflow-hidden font-medium text-muted-foreground text-xs transition-all duration-300",

                        isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
                      )}
                    >
                      {groupName}
                    </div>

                    <div className="space-y-2">
                      {SIDEBAR_GROUPS[groupName]
                        .filter((item) => {
                          // Hide workflows if feature flag is disabled
                          if ((item.id as string) === "workflows" && !workflowsEnabled) {
                            return false;
                          }
                          // Hide agent-community if feature flag is disabled
                          if ((item.id as string) === "agent-community" && !agentCommunityEnabled) {
                            return false;
                          }
                          return true;
                        })
                        .map((item) => {
                          const IconComponent = item.icon;

                          const isActive = pathname === item.href;

                          const apiStatusInfo = getComponentApiStatus(item.id);

                          const status =
                            item.apiStatus || apiStatusInfo?.status || "none";

                          return (
                            <Button
                              key={item.id}
                              variant={isActive ? "secondary" : "ghost"}
                              className={cn(
                                "h-10 transition-all duration-300",

                                isOpen
                                  ? "w-full justify-start px-2"
                                  : "w-10 justify-center px-0 mx-auto",

                                isActive && "bg-accent"
                              )}
                              asChild
                              title={!isOpen ? item.label : undefined}
                            >
                              <Link
                                href={item.href}
                                className={cn(
                                  "flex items-center w-full",

                                  isOpen ? "justify-between" : "justify-center"
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex items-center",

                                    isOpen ? "flex-1 min-w-0" : ""
                                  )}
                                >
                                  <IconComponent className="w-5 h-5 shrink-0" />

                                  <span
                                    className={cn(
                                      "overflow-hidden whitespace-nowrap transition-all duration-300",

                                      isOpen
                                        ? "w-auto ml-2 opacity-100"
                                        : "w-0 ml-0 opacity-0"
                                    )}
                                  >
                                    {item.label}
                                  </span>
                                </div>

                                {isOpen && shouldShowIndicators && (
                                  <div className="ml-2 shrink-0">
                                    <ApiStatusIndicator
                                      status={status}
                                      componentName={apiStatusInfo?.componentName}
                                      endpoints={apiStatusInfo?.endpoints}
                                    />
                                  </div>
                                )}
                              </Link>
                            </Button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={groupName} className="space-y-2 mb-4">
                <div
                  className={cn(
                    "mb-2 px-2 overflow-hidden font-medium text-muted-foreground text-xs transition-all duration-300",

                    isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
                  )}
                >
                  {groupName}
                </div>

                <div className="space-y-2">
                  {SIDEBAR_GROUPS[groupName]
                    .filter((item) => {
                      // Hide workflows if feature flag is disabled
                      if ((item.id as string) === "workflows" && !workflowsEnabled) {
                        return false;
                      }
                      // Hide agent-community if feature flag is disabled
                      if ((item.id as string) === "agent-community" && !agentCommunityEnabled) {
                        return false;
                      }
                      return true;
                    })
                    .map((item) => {
                      const IconComponent = item.icon;

                      const isActive = pathname === item.href;

                      const apiStatusInfo = getComponentApiStatus(item.id);

                      const status =
                        item.apiStatus || apiStatusInfo?.status || "none";

                      return (
                        <Button
                          key={item.id}
                          variant={isActive ? "secondary" : "ghost"}
                          className={cn(
                            "h-10 transition-all duration-300",

                            isOpen
                              ? "w-full justify-start px-2"
                              : "w-10 justify-center px-0 mx-auto",

                            isActive && "bg-accent"
                          )}
                          asChild
                          title={!isOpen ? item.label : undefined}
                        >
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center w-full",

                              isOpen ? "justify-between" : "justify-center"
                            )}
                          >
                            <div
                              className={cn(
                                "flex items-center",

                                isOpen ? "flex-1 min-w-0" : ""
                              )}
                            >
                              <IconComponent className="w-5 h-5 shrink-0" />

                              <span
                                className={cn(
                                  "overflow-hidden whitespace-nowrap transition-all duration-300",

                                  isOpen
                                    ? "w-auto ml-2 opacity-100"
                                    : "w-0 ml-0 opacity-0"
                                )}
                              >
                                {item.label}
                              </span>
                            </div>

                            {isOpen && shouldShowIndicators && (
                              <div className="ml-2 shrink-0">
                                <ApiStatusIndicator
                                  status={status}
                                  componentName={apiStatusInfo?.componentName}
                                  endpoints={apiStatusInfo?.endpoints}
                                />
                              </div>
                            )}
                          </Link>
                        </Button>
                      );
                    })}
                </div>
              </div>
            );
          })}

          {/* SECRETS GROUP */}
          <div className="space-y-2 mb-4">
            <div
              className={cn(
                "mb-2 px-2 overflow-hidden font-medium text-muted-foreground text-xs transition-all duration-300",
                isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
              )}
            >
              Secrets
            </div>
            <div className="space-y-2">
              <Button
                variant={pathname === "/secrets" ? "secondary" : "ghost"}
                className={cn(
                  "h-10 transition-all duration-300",
                  isOpen
                    ? "w-full justify-start px-2"
                    : "w-10 justify-center px-0 mx-auto",
                  pathname === "/secrets" && "bg-accent"
                )}
                asChild
                title={!isOpen ? "Secrets Manager" : undefined}
              >
                <Link
                  href="/secrets"
                  className={cn(
                    "flex items-center w-full",
                    isOpen ? "justify-between" : "justify-center"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center",
                      isOpen ? "flex-1 min-w-0" : ""
                    )}
                  >
                    <Lock className="w-5 h-5 shrink-0" />
                    <span
                      className={cn(
                        "overflow-hidden whitespace-nowrap transition-all duration-300",
                        isOpen
                          ? "w-auto ml-2 opacity-100"
                          : "w-0 ml-0 opacity-0"
                      )}
                    >
                      Secrets Manager
                    </span>
                  </div>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER (Pinned to bottom, outside scroll area) */}

      <div className="z-20 bg-muted/10 p-2 border-t">
        {userMenuTrigger ? (
          <div className="w-full">
            {userMenuTrigger}
          </div>
        ) : (
          <Button
            variant="ghost"
            className={cn(
              "p-2 w-full h-auto transition-all duration-300",

              isOpen ? "justify-start" : "justify-center"
            )}
          >
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback className="bg-primary/10 font-medium text-primary text-sm">
                {initial || "U"}
              </AvatarFallback>
            </Avatar>

            <div
              className={cn(
                "flex flex-col items-start overflow-hidden text-sm transition-all duration-300",

                isOpen ? "w-auto ml-2 opacity-100" : "w-0 ml-0 opacity-0"
              )}
            >
              <span className="font-medium truncate">
                {name ?? "Signed in user"}
              </span>

              <span className="text-muted-foreground text-xs truncate">
                {role ?? email ?? ""}
              </span>
            </div>
          </Button>
        )}
      </div>
    </aside>
  );
}

// Helper to read sidebar state from cookie
function getSidebarStateFromCookie(): boolean {
  if (typeof document === "undefined") return true;
  const cookies = document.cookie.split("; ");
  const sidebarCookie = cookies.find((c) => c.startsWith("sidebar_state="));
  if (sidebarCookie) {
    return sidebarCookie.split("=")[1] === "true";
  }
  return true;
}

// Subscribe to cookie changes (no-op since cookies don't have native events)
function subscribeToCookieChanges(callback: () => void): () => void {
  // Cookies don't have a native change event, so we just return a no-op
  return () => {};
}

export function CollapsibleSidebar({
  userMenuTrigger,

  children,
}: CollapsibleSidebarProps) {
  // Use useSyncExternalStore for hydration-safe cookie reading
  const cookieState = useSyncExternalStore(
    subscribeToCookieChanges,
    getSidebarStateFromCookie,
    () => true // Server snapshot - default to open
  );
  
  const [isOpen, setIsOpen] = useState(cookieState);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    // Persist to cookie

    document.cookie = `sidebar_state=${open}; path=/; max-age=${60 * 60 * 24 * 7}`;
  };

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen: handleOpenChange }}>
      <div className="flex bg-background w-full h-screen overflow-hidden">
        <AppSidebar
          isOpen={isOpen}
          setIsOpen={handleOpenChange}
          userMenuTrigger={userMenuTrigger}
        />

        <main className="relative flex flex-col flex-1 h-full min-w-0">{children}</main>
      </div>
    </SidebarContext.Provider>
  );
}
