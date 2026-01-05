"use client"

import { useState } from "react"
import { BookOpen, X, Sparkles, LifeBuoy, Search, Zap, FileCode, Shield } from "lucide-react"

import { DocsContent } from "@/components/DocsContent"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useRightSidebar } from "@/contexts/RightSidebarContext"

type RightSidebarTab = 'studio' | 'docs' | 'support'

export function RightSidebar() {
  const { expanded, setExpanded } = useRightSidebar()
  const [activeTab, setActiveTab] = useState<RightSidebarTab>('docs')

  const toggleSidebar = (tab: RightSidebarTab) => {
    if (expanded && activeTab === tab) {
      setExpanded(false)
    } else {
      setActiveTab(tab)
      setExpanded(true)
    }
  }

  const getTabContent = () => {
    switch (activeTab) {
      case 'studio':
        return (
          <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0 bg-background">
              <span className="font-bold text-foreground flex items-center gap-2">
                <Sparkles size={18} className="text-purple-600" /> Studio AI
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </Button>
            </div>
            <div className="flex-1 p-6 bg-muted/50 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                <Sparkles size={32} />
              </div>
              <h3 className="font-bold text-foreground mb-2">AI Assistant</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Ask questions about your agents, debugging help, or generate code snippets.
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Start Chat
              </Button>
            </div>
          </div>
        )
      case 'support':
        return (
          <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0 bg-background">
              <span className="font-bold text-foreground flex items-center gap-2">
                <LifeBuoy size={18} className="text-indigo-600" /> Support
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </Button>
            </div>
            <div className="flex-1 p-6 bg-muted/50 space-y-6 overflow-y-auto">
              <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-indigo-900 dark:text-indigo-100">
                    Enterprise Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                    Your team has priority access to our engineering support.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                  >
                    Open Ticket
                  </Button>
                </CardContent>
              </Card>
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Status
                </h4>
                <Badge 
                  variant="outline" 
                  className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900 flex items-center gap-2 w-fit"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  All systems operational
                </Badge>
              </div>
            </div>
          </div>
        )
      case 'docs':
      default:
        return (
          <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0 bg-background">
              <span className="font-bold text-foreground flex items-center gap-2">
                <BookOpen size={18} className="text-primary" /> Documentation
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-muted/50">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input
                  type="text"
                  placeholder="Search docs..."
                  className="w-full pl-9 text-xs"
                />
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 pl-2">
                    Getting Started
                  </h4>
                  <ul className="space-y-1">
                    <li>
                      <a
                        href="#"
                        className="block text-sm text-foreground hover:text-primary hover:bg-background px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        Quick Start Guide
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block text-sm text-foreground hover:text-primary hover:bg-background px-3 py-2 rounded-lg transition-colors"
                      >
                        Core Concepts
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block text-sm text-foreground hover:text-primary hover:bg-background px-3 py-2 rounded-lg transition-colors"
                      >
                        Platform Architecture
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 pl-2">
                    Guides
                  </h4>
                  <ul className="space-y-1">
                    <li>
                      <a
                        href="#"
                        className="block text-sm text-foreground hover:text-primary hover:bg-background px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Zap size={14} className="text-muted-foreground" /> Building Agents
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block text-sm text-foreground hover:text-primary hover:bg-background px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FileCode size={14} className="text-muted-foreground" /> Scripting API
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block text-sm text-foreground hover:text-primary hover:bg-background px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Shield size={14} className="text-muted-foreground" /> Security Policies
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 pl-2">
                    Reference
                  </h4>
                  <ul className="space-y-1">
                    <li>
                      <a
                        href="#"
                        className="block text-sm text-foreground hover:text-primary hover:bg-background px-3 py-2 rounded-lg transition-colors"
                      >
                        Prompt Engineering
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block text-sm text-foreground hover:text-primary hover:bg-background px-3 py-2 rounded-lg transition-colors"
                      >
                        Workflow Nodes
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 border-l border-border bg-background transition-[width] duration-300 ease-in-out lg:flex lg:flex-col",
        expanded ? "w-80" : "w-12"
      )}
    >
      <div className="flex h-full w-full flex-col">
        {/* Collapsed state - vertical icon buttons */}
        {!expanded && (
          <div className="flex flex-col items-center py-4 gap-6 h-full bg-muted/30">
            {/* Studio AI */}
            <Button
              variant="ghost"
              onClick={() => toggleSidebar('studio')}
              className="group flex flex-col items-center gap-2 py-4 w-full hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors relative h-auto"
            >
              <div className="p-2 text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                <Sparkles size={20} />
              </div>
              <div className="h-24 w-6 flex items-center justify-center relative">
                <span className="text-xs font-bold text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 tracking-widest uppercase whitespace-nowrap absolute transform rotate-90 origin-center translate-y-2">
                  Studio AI
                </span>
              </div>
            </Button>

            {/* Docs */}
            <Button
              variant="ghost"
              onClick={() => toggleSidebar('docs')}
              className="group flex flex-col items-center gap-2 py-4 w-full hover:bg-primary/10 transition-colors relative h-auto"
            >
              <div className="p-2 text-muted-foreground group-hover:text-primary transition-colors">
                <BookOpen size={20} />
              </div>
              <div className="h-16 w-6 flex items-center justify-center relative">
                <span className="text-xs font-bold text-muted-foreground group-hover:text-primary tracking-widest uppercase whitespace-nowrap absolute transform rotate-90 origin-center translate-y-2">
                  Docs
                </span>
              </div>
            </Button>

            {/* Support */}
            <Button
              variant="ghost"
              onClick={() => toggleSidebar('support')}
              className="group flex flex-col items-center gap-2 py-4 w-full hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors relative h-auto mt-auto"
            >
              <div className="p-2 text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                <LifeBuoy size={20} />
              </div>
              <div className="h-20 w-6 flex items-center justify-center relative">
                <span className="text-xs font-bold text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 tracking-widest uppercase whitespace-nowrap absolute transform rotate-90 origin-center translate-y-2">
                  Support
                </span>
              </div>
            </Button>
          </div>
        )}

        {/* Expanded state - full content */}
        {expanded && getTabContent()}
      </div>
    </aside>
  )
}

