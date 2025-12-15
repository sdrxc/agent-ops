import { getServerSession } from "next-auth";
import {ProjectRegister} from "@/features/ProjectRegister/ProjectRegister";
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