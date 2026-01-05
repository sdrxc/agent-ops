"use client";

import { useState } from "react";
import { IncidentFormDialog } from "@/components/IncidentFormDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import {
  PageToolbar,
  MetricsGrid,
  ContentGrid,
} from "@/components/page-sections";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Plus, Filter, Clock, CheckCircle } from "lucide-react";

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved";
  agentId: string;
  agentName: string;
  createdAt: string;
  resolvedAt?: string;
}

const mockIncidents: Incident[] = [
  {
    id: "1",
    title: "High Error Rate in Customer Support Agent",
    description:
      "Customer Support Agent showing 15% error rate over the past hour. Multiple users reporting incomplete responses and system timeouts.",
    severity: "high",
    status: "investigating",
    agentId: "1",
    agentName: "Customer Support Agent",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    title: "Translation Service Timeout",
    description:
      "Translation service experiencing timeout issues for requests longer than 500 characters. Affecting productivity workflows.",
    severity: "critical",
    status: "open",
    agentId: "5",
    agentName: "Translation Service",
    createdAt: "2024-01-15T09:45:00Z",
  },
  {
    id: "3",
    title: "Code Review Agent False Positives",
    description:
      "Code review agent flagging valid code patterns as issues. Increased false positive rate by 12%.",
    severity: "medium",
    status: "resolved",
    agentId: "3",
    agentName: "Code Review Assistant",
    createdAt: "2024-01-14T14:20:00Z",
    resolvedAt: "2024-01-15T08:15:00Z",
  },
  {
    id: "4",
    title: "Data Analyst Memory Leak",
    description:
      "Memory usage continuously increasing during large dataset processing. System performance degraded.",
    severity: "high",
    status: "investigating",
    agentId: "4",
    agentName: "Data Analyst",
    createdAt: "2024-01-14T16:50:00Z",
  },
  {
    id: "5",
    title: "Content Generator Repetitive Output",
    description:
      "Content generator producing similar content patterns. Quality degradation noticed in recent outputs.",
    severity: "low",
    status: "resolved",
    agentId: "2",
    agentName: "Content Generator",
    createdAt: "2024-01-13T11:30:00Z",
    resolvedAt: "2024-01-14T09:45:00Z",
  },
];

export const IncidentReporting = () => {
  const [incidents] = useState<Incident[]>(mockIncidents);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Filter incidents based on search and filters
  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.agentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || incident.status === statusFilter;
    const matchesSeverity =
      severityFilter === "all" || incident.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // Prepare metrics for MetricsGrid
  const metrics = [
    {
      label: "Total Incidents",
      value: incidents.length,
      description: "Last 30 days",
      icon: (
        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
          <div className="h-4 w-4 bg-purple-600 rounded-full"></div>
        </div>
      ),
    },
    {
      label: "Open",
      value: incidents.filter((i) => i.status === "open").length,
      description: "+2 from last week",
      icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
    },
    {
      label: "In Progress",
      value: incidents.filter((i) => i.status === "investigating").length,
      description: "Avg 4.2h resolution",
      icon: <Clock className="h-5 w-5 text-blue-600" />,
    },
    {
      label: "Resolved",
      value: incidents.filter((i) => i.status === "resolved").length,
      description: "94% this month",
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    },
  ];

  const getSeverityColor = (severity: Incident["severity"]) => {
    switch (severity) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  const getStatusColor = (status: Incident["status"]) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 border-red-200";
      case "investigating":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Incident Reporting"
          description="Report and track security incidents and anomalies"
          actions={
            <Button onClick={() => setIsReportDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          }
        />

        {/* Search and Filters */}
        <PageToolbar
          searchPlaceholder="Search incidents..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filters={
            <>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </>
          }
        />

        {/* Metrics */}
        <div className="space-y-6 bg-gradient-to-r from-violet-100 dark:from-violet-900/50 to-violet-200 dark:to-violet-800/50 p-6 rounded-2xl border border-violet-200/50 dark:border-violet-700/50 @container">
          <MetricsGrid metrics={metrics} />
        </div>

        {/* Incidents List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Incidents</h2>
            <div className="text-sm text-muted-foreground">
              Showing {filteredIncidents.length} of {incidents.length} incidents
            </div>
          </div>

          <ContentGrid
            columns={{ sm: 1, md: 1, lg: 1, xl: 1 }}
            empty={filteredIncidents.length === 0}
          >
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((incident) => (
                <Card
                  key={incident.id}
                  className="hover:bg-accent/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold">{incident.title}</h3>
                          <Badge
                            className={getSeverityColor(incident.severity)}
                          >
                            {incident.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          {incident.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>Agent: {incident.agentName}</span>
                          <span>
                            Created:{" "}
                            {new Date(incident.createdAt).toLocaleDateString()}
                          </span>
                          {incident.resolvedAt && (
                            <span>
                              Resolved:{" "}
                              {new Date(
                                incident.resolvedAt
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 md:flex-nowrap md:shrink-0">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {incident.status !== "resolved" && (
                          <Button size="sm">Update Status</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No incidents match your current filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setSeverityFilter("all");
                  }}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </ContentGrid>
        </div>
      </div>

      {/* Incident Form Dialog */}
      <IncidentFormDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
      />
    </>
  );
};
