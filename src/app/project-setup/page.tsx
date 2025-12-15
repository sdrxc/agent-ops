import { getServerSession } from "next-auth";
import {ProjectSetup} from "@/features/ProjectSetup/ProjectSetup";
import { Layout } from "@/components/Layout";

export default async function Page() {

    // const session = await getServerSession();
    // if (!session) {
    //     return }
    
    return (
        <Layout>
            <ProjectSetup />
        </Layout>
    )
}