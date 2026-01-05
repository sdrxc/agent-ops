import { getServerSession } from "@/lib/auth";
import {ProjectSetup} from "@/domains/projects/setup/ProjectSetup";
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