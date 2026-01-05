"use client";

import { useGlobalContext } from "@/app/GlobalContextProvider";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { SecretManager } from "@/components/features/secrets/SecretManager";
// import { Shield, Key } from "lucide-react"; // Unused now

export default function SettingsPage() {
    const { user } = useGlobalContext();

    // If user is not loaded yet, we might want to show loading, but SecretManager handles it gracefully or empty.
    // We'll pass user.userID only if user exists.

    if (!user) {
        return (
            <Layout>
                <div className="p-8 text-center text-muted-foreground">Loading settings...</div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="space-y-6 max-w-5xl mx-auto">
                <PageHeader
                    title="Secrets Manager"
                    description="Securely manage your global API keys."
                />

                <div className="space-y-6">
                    {/* <div className="bg-background rounded-lg border border-border p-6 shadow-sm"> */}
                    <SecretManager
                        scope="user"
                        entityID={user.userID}
                    />
                    {/* </div> */}
                </div>
            </div>
        </Layout>
    );
}
