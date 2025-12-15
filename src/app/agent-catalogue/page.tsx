import { getServerSession } from "next-auth";
import { AgentCatalogue } from "@/features/AgentCatalogue/AgentCatalogue";

export default async function Page() {

    // const session = await getServerSession();
    // if (!session) {
    //     return }
    
    return <AgentCatalogue />
}