import { Layout } from "@/components/Layout";
import { AgentDeployment } from "@/domains/deployment/AgentDeployment";
import { AgentDeploymentProvider } from "@/domains/deployment/components/context/AgentDeploymentContext";
import { PageHeader } from "@/components/PageHeader";

interface DeploymentPageProps {
  params: Promise<{
    projectID: string;
  }>;
}

export default async function DeploymentPage({ params }: DeploymentPageProps) {
  const { projectID } = await params;

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <PageHeader
          title="Deploy Agent"
          description="Configure and launch your AI agent"
          backButton={{ href: `/projects/${projectID}`, label: "Back to Project" }}
        />

        <AgentDeploymentProvider>
          <AgentDeployment projectID={projectID} />
        </AgentDeploymentProvider>
      </div>
    </Layout>
  );
}
