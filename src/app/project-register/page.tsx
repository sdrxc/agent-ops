import { getServerSession } from "@/lib/auth";
import {ProjectRegister} from "@/domains/projects/register/ProjectRegister";
import { Layout } from "@/components/Layout";

export default async function Page() {

    // const session = await getServerSession();
    // if (!session) {
    //     return }
    
    return (
        <Layout>
            <ProjectRegister />
        </Layout>
    )
}