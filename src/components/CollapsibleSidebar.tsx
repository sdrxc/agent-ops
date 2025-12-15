"use client";

import { type ReactNode, useEffect, useState } from "react";
import {
  Bot,
  DollarSign,
  AlertTriangle,
  Rocket,
  Book,
  Wrench,
  Server,
  Home,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  useSidebar,
  SidebarTrigger,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface CollapsibleSidebarProps {
  userMenuTrigger?: ReactNode;
  children: ReactNode;
}

// const SIDEBAR_GROUPS = {
//   Create: [
//     {
//       id: "projects-directory",
//       label: "Your Projects",
//       icon: Rocket,
//       href: "/projects-directory",
//     },
//   ],
//   Manage: [
//     {
//       id: "agenthub",
//       label: "AgentHub",
//       icon: Home,
//       href: "/",
//     },
//     {
//       id: "incident-reporting",
//       label: "Incident Reporting",
//       icon: AlertTriangle,
//       href: "/incident-reporting",
//     },
//     {
//       id: "cost-estimation",
//       label: "Cost Estimation",
//       icon: DollarSign,
//       href: "/cost-estimation",
//     },
//   ],
//   Optimize: [
//     {
//       id: "agent-catalogue",
//       label: "Agent Catalogue",
//       icon: Bot,
//       href: "/agent-catalogue",
//     },
//     {
//       id: "tool-catalogue",
//       label: "Tool Catalogue",
//       icon: Wrench,
//       href: "/tool-catalogue",
//     },
//     {
//       id: "server-catalogue",
//       label: "Server Catalogue",
//       icon: Server,
//       href: "/server-catalogue",
//     },
//     {
//       id: "user-guide",
//       label: "User Guide",
//       icon: Book,
//       href: "/user-guide",
//     },
//   ],
// } as const;


const SIDEBAR_GROUPS = {
  Manage: [
    {
      id: "agenthub",
      label: "Home",
      icon: Home,
      href: "/",
    },
    {
      id: "incident-reporting",
      label: "Incident Reporting",
      icon: AlertTriangle,
      href: "/incident-reporting",
    },
    {
      id: "cost-estimation",
      label: "Cost Estimation",
      icon: DollarSign,
      href: "/cost-estimation",
    },
  ],
  Optimize: [
    {
      id: "agent-catalogue",
      label: "Agent Catalogue",
      icon: Bot,
      href: "/agent-catalogue",
    },
    {
      id: "tool-catalogue",
      label: "Tool Catalogue",
      icon: Wrench,
      href: "/tool-catalogue",
    },
    {
      id: "server-catalogue",
      label: "Server Catalogue",
      icon: Server,
      href: "/server-catalogue",
    },
  ],
} as const;


function SidebarFooterContent({
  userMenuTrigger,
}: {
  userMenuTrigger?: ReactNode;
}) {
  const { isMobile } = useSidebar();

  if (isMobile) {
    return (
      <div className="flex w-full items-center justify-between gap-2">
        <Button
          asChild
          variant="outline"
          className="shrink-0 justify-start gap-2 bg-transparent text-sidebar-foreground"
        >
          <Link href="/user-guide">
            <Book className="size-4" />
            <span>Docs</span>
          </Link>
        </Button>
        {userMenuTrigger && (
          <div className="flex items-center justify-center">
            {userMenuTrigger}
          </div>
        )}
      </div>
    );
  }

  return (
    <SidebarTrigger
      className="h-10 w-10 [&_svg]:size-5"
      title="Toggle sidebar"
    />
  );
}


function AppSidebar({ userMenuTrigger }: { userMenuTrigger?: ReactNode }) {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const router = useRouter();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 py-2">
          <div className="
  flex size-8 shrink-0 items-center justify-center 
  rounded-lg bg-primary text-sidebar-primary-foreground
  transition-all duration-300
  hover:shadow-[0_0_8px_rgba(255,255,255,0.6)]
  hover:-translate-y-1 hover:scale-105
  hover:bg-primary/90
">
            <Bot
              className="!size-5 transition-all duration-300"
              onClick={() => router.push("/")}
            />
          </div>
          <div className="flex flex-1 flex-col gap-0 overflow-hidden text-sm leading-tight">
            <span className="truncate font-semibold">Agentrix</span>
            <span className="truncate text-xs">AI Management</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {(
          Object.keys(SIDEBAR_GROUPS) as Array<keyof typeof SIDEBAR_GROUPS>
        ).map((groupName) => (
          <SidebarGroup key={groupName} className="gap-2">
            <SidebarGroupLabel>{groupName}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {SIDEBAR_GROUPS[groupName].map((item) => {
                  const IconComponent = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <Link
                          href={item.href}
                          className="!px-1.5 !py-2 group-data-[collapsible=icon]:!px-1.5 group-data-[state=expanded]:!px-1.5"
                        >
                          <IconComponent className="!size-5" />
                          <span className="group-data-[collapsible=icon]:hidden">
                            {item.label}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter
        className={cn(
          "border-t border-sidebar-border/60 bg-sidebar",
          isMobile && "shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
        )}
      >
        <SidebarFooterContent userMenuTrigger={userMenuTrigger} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export function CollapsibleSidebar({
  userMenuTrigger,
  children,
}: CollapsibleSidebarProps) {
  const [open, setOpen] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // Read cookie after mount to avoid hydration issues
    const cookies = document.cookie.split("; ");
    const sidebarCookie = cookies.find((c) => c.startsWith("sidebar_state="));
    if (sidebarCookie) {
      setOpen(sidebarCookie.split("=")[1] === "true");
    } else {
      setOpen(true);
    }
  }, []);

  // Don't render until we've read the cookie
  if (open === undefined) {
    return null;
  }

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <AppSidebar userMenuTrigger={userMenuTrigger} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
