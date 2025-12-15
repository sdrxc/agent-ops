import { getServerSession } from "next-auth";
import { ProjectDirectory } from "@/features/ProjectDirectory/ProjectDirectory";

export default async function Page() {

    // const session = await getServerSession();
    // if (!session) {
    //     return }
    
    return <ProjectDirectory />
}