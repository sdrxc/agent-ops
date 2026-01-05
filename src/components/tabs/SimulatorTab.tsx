"use client";

import { Agent } from "@/types/api";
import { SimulatorCore } from "@/components/simulator/SimulatorCore";

export interface SimulatorTabProps {
  agent: Agent;
}

/**
 * SimulatorTab - Embedded simulator for agent detail page
 *
 * This component wraps SimulatorCore and configures it for embedded mode
 * within the agent detail page. It pre-populates the simulator with the
 * current agent and hides unnecessary UI elements like the agent selector
 * and page header.
 */
export function SimulatorTab({ agent }: SimulatorTabProps) {
  return (
    <div className="h-full">
      <SimulatorCore
        agentId={agent.id}
        showAgentSelector={false}
        embedded={true}
        showPageHeader={false}
        defaultMode="chat"
        defaultEnvironment="Development"
      />
    </div>
  );
}
