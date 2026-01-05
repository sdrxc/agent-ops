"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/Layout"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Workflow } from "lucide-react"
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext"

export default function WorkflowsPage() {
  const router = useRouter()
  const { workflowsEnabled } = useFeatureFlags()

  useEffect(() => {
    if (!workflowsEnabled) {
      router.push("/")
    }
  }, [workflowsEnabled, router])

  if (!workflowsEnabled) {
    return null
  }

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Workflows"
          description="Design and orchestrate multi-agent systems"
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="size-5" />
              Workflow Builder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Canvas functionality coming soon. This page will allow you to
              visually design and build complex multi-agent workflows.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}




