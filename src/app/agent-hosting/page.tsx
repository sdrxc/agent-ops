import { getServerSession } from "@/lib/auth";
import { AgentHosting } from "@/features/AgentHosting/AgentHosting";

export default async function Page() {    
    return <AgentHosting />
}
