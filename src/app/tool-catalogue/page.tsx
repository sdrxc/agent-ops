import { getServerSession } from "next-auth";
import { ToolCatalogue } from "@/features/ToolCatalogue/ToolCatalogue";

export default async function Page() {

    // const session = await getServerSession();
    // if (!session) {
    //     return }
    
    return <ToolCatalogue />
}