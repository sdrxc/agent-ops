"use client"

import { Layout } from "@/components/Layout"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext"

export default function DevSettingsPage() {
  const {
    workflowsEnabled,
    setWorkflowsEnabled,
    agentCommunityEnabled,
    setAgentCommunityEnabled,
    legacyIntegrationsEnabled,
    setLegacyIntegrationsEnabled,
    projectDetailsMetricsEnabled,
    setProjectDetailsMetricsEnabled,
    simulatorChatEnabled,
    setSimulatorChatEnabled,
    studioMinStars,
    setStudioMinStars,
    devModeMinStars,
    setDevModeMinStars,
    studioShowOthersOnFollowingPages,
    setStudioShowOthersOnFollowingPages,
    devModeShowOthersOnFollowingPages,
    setDevModeShowOthersOnFollowingPages,
  } = useFeatureFlags()

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Developer Settings"
          description="Configure feature flags and development options"
        />

        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
            <CardDescription>
              Toggle features on and off. Changes are saved automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="workflows-toggle" className="text-base">
                  Workflows
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable the Workflows page and navigation link
                </p>
              </div>
              <Switch
                id="workflows-toggle"
                checked={workflowsEnabled}
                onCheckedChange={setWorkflowsEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="agent-community-toggle" className="text-base">
                  Agent Community
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable the Agent Community page and navigation link
                </p>
              </div>
              <Switch
                id="agent-community-toggle"
                checked={agentCommunityEnabled}
                onCheckedChange={setAgentCommunityEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="legacy-integrations-toggle" className="text-base">
                  Legacy Integrations (Servers & Tools)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show the Servers and Tools tabs on the Integrations page
                </p>
              </div>
              <Switch
                id="legacy-integrations-toggle"
                checked={legacyIntegrationsEnabled}
                onCheckedChange={setLegacyIntegrationsEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="project-details-metrics-toggle" className="text-base">
                  Project Details Metrics
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show metadata, performance dashboard, and detailed metrics on project detail pages
                </p>
              </div>
              <Switch
                id="project-details-metrics-toggle"
                checked={projectDetailsMetricsEnabled}
                onCheckedChange={setProjectDetailsMetricsEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="simulator-chat-toggle" className="text-base">
                  Simulator Chat Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable the Chat option in the Agent Simulator
                </p>
              </div>
              <Switch
                id="simulator-chat-toggle"
                checked={simulatorChatEnabled}
                onCheckedChange={setSimulatorChatEnabled}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations Display Settings</CardTitle>
            <CardDescription>
              Control how integrations are displayed and paginated based on star counts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="studio-min-stars" className="text-base">
                  Studio Mode - Minimum Stars for Page 1
                </Label>
                <p className="text-sm text-muted-foreground">
                  Integrations with at least this many stars appear on page 1 in Studio mode
                </p>
              </div>
              <Input
                id="studio-min-stars"
                type="number"
                min={0}
                value={studioMinStars}
                onChange={(e) => setStudioMinStars(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dev-mode-min-stars" className="text-base">
                  Dev Mode - Minimum Stars for Page 1
                </Label>
                <p className="text-sm text-muted-foreground">
                  Integrations with at least this many stars appear on page 1 in Dev mode
                </p>
              </div>
              <Input
                id="dev-mode-min-stars"
                type="number"
                min={0}
                value={devModeMinStars}
                onChange={(e) => setDevModeMinStars(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="studio-show-others-toggle" className="text-base">
                  Studio Mode - Show items below threshold on following pages
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, integrations below the star threshold appear on page 2+ in Studio mode. When disabled, they are hidden entirely.
                </p>
              </div>
              <Switch
                id="studio-show-others-toggle"
                checked={studioShowOthersOnFollowingPages}
                onCheckedChange={setStudioShowOthersOnFollowingPages}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dev-mode-show-others-toggle" className="text-base">
                  Dev Mode - Show items below threshold on following pages
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, integrations below the star threshold appear on page 2+ in Dev mode. When disabled, they are hidden entirely.
                </p>
              </div>
              <Switch
                id="dev-mode-show-others-toggle"
                checked={devModeShowOthersOnFollowingPages}
                onCheckedChange={setDevModeShowOthersOnFollowingPages}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

