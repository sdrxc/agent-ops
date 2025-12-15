"use client";
 
import { useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";
import { AgentHub } from "@/features/Agenthub/Agenthub";
import {HomePageFeature}  from "@/features/HomePage/Homepage";

 
export default function HomePage() {
  const router = useRouter();
 
  return (
    <Layout>
      <div className="space-y-8">
        {/* <AgentHub /> */}
        <HomePageFeature />
      </div>
    </Layout>
  );
}