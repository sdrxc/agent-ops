import { getServerSession } from "@/lib/auth";
import { UserGuide } from "@/features/UserGuide/UserGuide";

export default async function Page() {

    // const session = await getServerSession();
    // if (!session) {
    //     return }
    
    return <UserGuide />
}