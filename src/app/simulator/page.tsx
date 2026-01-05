"use client";

import { Layout } from "@/components/Layout";
import { SimulatorCore } from "@/components/simulator/SimulatorCore";
import { Activity } from "lucide-react";
import { Suspense } from "react";

/**
 * Standalone Simulator Page
 *
 * This page provides a full-featured simulator environment for testing agents.
 * It uses the SimulatorCore component with configuration for standalone mode.
 */
function SimulatorPageContent() {
  return (
    <Layout>
      <SimulatorCore
        showAgentSelector={true}
        embedded={false}
        showPageHeader={true}
        defaultMode="api"
        defaultEnvironment="Development"
      />
    </Layout>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense
      fallback={
        <Layout>
          <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
            <div className="text-center">
              <Activity className="mx-auto mb-4 size-8 text-muted-foreground animate-spin" />
              <p className="text-muted-foreground text-sm">
                Loading simulator...
              </p>
            </div>
          </div>
        </Layout>
      }
    >
      <SimulatorPageContent />
    </Suspense>
  );
}
