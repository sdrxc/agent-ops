import { getServerSession } from "next-auth";
import { ServerCatalogue } from "@/features/ServerCatalogue/ServerCatalogue";

interface PageProps {
  params: { projectID: string };
}

export default async function Page({ params }: PageProps) {

    // const session = await getServerSession();
    // if (!session) {
    //     return }
    
    return <ServerCatalogue projectID={params.projectID} />
}