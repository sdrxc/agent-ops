import { Layout } from "@/components/Layout";
import { AgentBuilder } from "@/domains/deployment/AgentBuilder";
import { AgentDeploymentProvider } from "@/domains/deployment/components/context/AgentDeploymentContext";

interface BuilderPageProps {
    params: Promise<{
        projectID: string;
    }>;
}

export default async function BuilderPage({ params }: BuilderPageProps) {
    const { projectID } = await params;

    return (
        <Layout fullWidth>
            <AgentDeploymentProvider>
                <AgentBuilder projectID={projectID} />
            </AgentDeploymentProvider>
        </Layout>
    );
}
