import { getServerSession } from "next-auth";
import {IncidentReporting} from "@/features/IncidentReporting/IncidentReporting";

export default async function Page() {    
    return <IncidentReporting />
}