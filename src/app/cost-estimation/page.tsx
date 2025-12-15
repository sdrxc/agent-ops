import { getServerSession } from "next-auth";
import {CostEstimation} from "@/features/CostEstimation/CostEstimation";

export default async function Page() {

    // const session = await getServerSession();
    // if (!session) {
    //     return }
    
    return <CostEstimation />
}


