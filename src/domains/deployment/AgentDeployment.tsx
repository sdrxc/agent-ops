"use client";

import { useState, useContext, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

import { useGlobalContext } from "@/app/GlobalContextProvider";
import { AgentDeploymentContext } from "./components/context/AgentDeploymentContext";
import { useRightSidebar } from "@/contexts/RightSidebarContext";

// Domain Components
import AgentRegistration from "./components/steps/AgentRegistration";
import ToolConfiguration from "./components/steps/ToolConfiguration";
import ServerConfiguration from "./components/steps/ServerConfiguration";
import SecretsConfiguration from "./components/steps/SecretsConfiguration";
// CodeRepository is now integrated into AgentRegistry (Section 1)

import { DeploymentSidebar, StepItem } from "./components/DeploymentSidebar";

const INITIAL_STEPS: StepItem[] = [
  {
    id: "1",
    title: "Agent Registry",
    description: "Identity & capabilities",
    isCompleted: false,
    isLocked: false,
  },
  {
    id: "2",
    title: "Tools & Integrations",
    description: "External tool access",
    isCompleted: false,
    isLocked: false,
    isOptional: true,
  },
  {
    id: "3",
    title: "Server Configuration",
    description: "Compute resources",
    isCompleted: false,
    isLocked: false,
  },
  {
    id: "4",
    title: "Secrets Manager",
    description: "Environment variables",
    isCompleted: false,
    isLocked: false,
    isOptional: true,
  },
];

interface AgentDeploymentProps {
  projectID: string;
}

export const AgentDeployment = ({ projectID }: AgentDeploymentProps) => {
  const { state, dispatch } = useContext(AgentDeploymentContext);
  const { user, loading } = useGlobalContext();
  const { width: rightSidebarWidth } = useRightSidebar();
  const router = useRouter();

  const [activeSection, setActiveSection] = useState("1");
  const [isDeploying, setIsDeploying] = useState(false);

  // We keep sequenceID stable
  const [sequenceID] = useState(() => {
    const now = new Date().toISOString();
    const unique = uuidv4();
    return `${projectID}-${now}-${unique}`;
  });

  // Compute step completion status from context state (derived state)
  const stepItems = useMemo<StepItem[]>(() => {
    return INITIAL_STEPS.map((item) => {
      let isCompleted = false;

      switch (item.id) {
        case "1": // Agent Registry (includes Code Repository)
          isCompleted =
            !!state.agentRegistry.name && !!state.agentRegistry.version;
          break;
        case "2": // Tools (Optional)
          isCompleted = state.toolsRegistry && state.toolsRegistry.length > 0;
          break;
        case "3": // Server
          isCompleted = !!state.selectedServerID;
          break;
        case "4": // Secrets (Optional)
          isCompleted =
            state.secretsManager && state.secretsManager.length > 0;
          break;
      }

      return { ...item, isCompleted, isLocked: false };
    });
  }, [
    state.agentRegistry,
    state.toolsRegistry,
    state.selectedServerID,
    state.secretsManager,
  ]);

  // Handle anchor navigation - scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionId);
    }
  };

  // Intersection Observer to track active section while scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id.replace("section-", "");
            setActiveSection(sectionId);
          }
        });
      },
      { threshold: 0.5, rootMargin: "-100px 0px -50% 0px" }
    );

    // Observe all sections (Code Repository removed - now part of Section 1)
    const sections = ["1", "2", "3", "4"];
    sections.forEach((id) => {
      const element = document.getElementById(`section-${id}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const handleDeploy = async () => {
    const userID = user!.userID;
    setIsDeploying(true);
    try {
      const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
      const isLocalEnv = runtimeEnv === "local";
      const url = isLocalEnv
        ? `${baseURL}/api/step6-deployAgent`
        : `/api/step6-deployAgent`;

      const response = await axios.post(url, {
        sequenceID,
        userID,
        projectID,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Deployment Initiated Successfully!");
        // We can add a delay before redirecting so user sees the success message/confetti
        setTimeout(() => {
          router.push(`/projects/${projectID}`);
        }, 2000);
      } else {
        toast.error("Deployment signal failed.");
        setIsDeploying(false);
      }
    } catch (error) {
      console.error("Deployment failed:", error);
      toast.error("Deployment Failed");
      setIsDeploying(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="p-8 text-muted-foreground text-center">Loading workspace...</div>
    );
  }

  return (
    <>
      {/* Main Content Area - Normal page flow with padding for fixed sidebar */}
      <div className="space-y-6 pr-80 pb-8">
        {/* Section 1: Agent Registry */}
        <section id="section-1" className="scroll-mt-6">
          <AgentRegistration
            sequenceID={sequenceID}
            projectID={projectID}
            userID={user.userID}
            stepID="101"
            onStepValidate={() => {}}
            onNext={() => {}}
          />
        </section>

        {/* Section 2: Tools & Integrations */}
        <section id="section-2" className="scroll-mt-6">
          <ToolConfiguration
            sequenceID={sequenceID}
            projectID={projectID}
            userID={user.userID}
            stepID="102"
            onStepValidate={() => {}}
            onNext={() => {}}
            onPrevious={() => {}}
          />
        </section>

        {/* Section 3: Server Configuration */}
        <section id="section-3" className="scroll-mt-6">
          <ServerConfiguration
            sequenceID={sequenceID}
            projectID={projectID}
            userID={user.userID}
            stepID="103"
            onStepValidate={() => {}}
            onNext={() => {}}
            onPrevious={() => {}}
          />
        </section>

        {/* Section 4: Secrets Manager (Code Repository is now part of Agent Registry) */}
        <section id="section-4" className="scroll-mt-6">
          <SecretsConfiguration
            sequenceID={sequenceID}
            projectID={projectID}
            userID={user.userID}
            stepID="105"
            onStepValidate={() => {}}
            onNext={() => {}}
            onPrevious={() => {}}
          />
        </section>
      </div>

      {/* Deployment Navigation Sidebar - Fixed position, reacts to RightSidebar width */}
      <div
        className="top-0 z-20 fixed bg-background border-border border-l w-80 h-screen overflow-y-auto transition-[right] duration-300"
        style={{
          right: `calc(${rightSidebarWidth} + 8px)`,
        }}
      >
        <DeploymentSidebar
          steps={stepItems}
          activeStepId={activeSection}
          onStepClick={scrollToSection}
          onDeploy={handleDeploy}
          isDeploying={isDeploying}
        />
      </div>
    </>
  );
};
