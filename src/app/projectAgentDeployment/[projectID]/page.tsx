import { Layout } from "@/components/Layout";
import { AgentDeployment } from "@/features/AgentDeployment/AgentDeployment";
import { AgentDeploymentProvider } from "@/features/AgentDeployment/components/context/AgentDeploymentContext";
import { Bot } from "lucide-react";

interface DeploymentPageProps {
  params: Promise<{
    projectID: string;
  }>;
}

export default async function DeploymentPage({ params }: DeploymentPageProps) {
  const { projectID } = await params; // ✅ await the Promise

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
        {/* Modern Header: Deploy/Agent on left, Details on right */}
        <header className="bg-white dark:bg-gray-800 shadow-md dark:shadow-lg rounded-lg p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          {/* Left: Deploy/Agent Info */}
          <div className="flex items-center gap-4">
            <div className="p-4 bg-linear-to-br from-green-400 to-teal-500 rounded-xl shadow-md flex items-center justify-center">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Deploy Agent
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Configure and launch your AI agent
              </p>
            </div>
          </div>

          {/* Right: Deployment Details */}
          <div className="flex items-center justify-end">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-center">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Project ID
              </h3>
              <p className="break-all font-mono text-gray-900 dark:text-gray-100">
                {projectID}
              </p>
            </div>
          </div>
        </header>

        {/* Agent Deployment Section */}
        <div className="max-width">
          {/* <AgentDeployment projectID={projectID} /> */}
          <AgentDeploymentProvider>
            <AgentDeployment projectID={projectID} />
          </AgentDeploymentProvider>
        </div>
      </div>
    </Layout>
  );
}
