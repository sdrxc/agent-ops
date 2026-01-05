"use client";

import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { IngestionZone } from "@/features/KnowledgeBase/components/IngestionZone";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import axios from "axios";

export default function KnowledgeNewPage() {
    const router = useRouter();
    const [collectionName, setCollectionName] = useState("New Collection");
    const [isSaving, setIsSaving] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    // Handle save
    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            const runtimeEnv = process.env.NEXT_PUBLIC_APP_ENV;
            const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
            const isLocalEnv = runtimeEnv === "local";

            const url = isLocalEnv
                ? `${baseURL}/api/knowledge/collections`
                : `/api/knowledge/collections`;

            const response = await axios.post(url, {
                name: collectionName,
                description: "Add a description...",
                tags: ["New"],
            });

            const newCollection = response.data?.data?.collection;
            if (newCollection) {
                // Navigate to the knowledge page with the new collection selected
                router.push("/knowledge");
            }
        } catch (error) {
            console.error("Error creating collection:", error);
        } finally {
            setIsSaving(false);
        }
    }, [collectionName, router]);

    // Handle file add from ingestion zone
    const handleFileAdd = (file: File) => {
        setUploadedFiles((prev) => [...prev, file]);
    };

    // Handle URL add
    const handleUrlAdd = (url: string) => {
        console.log("URL added:", url);
        // In production, this would process the URL
    };

    return (
        <Layout fullWidth>
            <div className="flex flex-col h-full">
                <div className="flex-none px-4 md:px-6 py-4">
                    <PageHeader
                        backButton={{ href: "/knowledge", label: "Back to Knowledge Base" }}
                        editableTitle={{
                            value: collectionName,
                            onChange: setCollectionName,
                            placeholder: "Collection name",
                        }}
                        actions={
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    size="sm"
                                >
                                    {isSaving ? (
                                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 w-4 h-4" />
                                    )}
                                    Create Collection
                                </Button>
                            </div>
                        }
                    />
                </div>

                <div className="flex-1 min-h-0 overflow-auto px-4 md:px-6 pb-6">
                    <div className="max-w-4xl space-y-6">
                        {/* Collection Info Card */}
                        <div className="">
                            <h2 className="text-lg font-medium mb-2">Knowledge Sources</h2>
                            <p className="text-muted-foreground mb-6">
                                Upload documents, guidelines, and reference materials to give your agent the knowledge it needs to do its job effectively.
                            </p>

                            {/* Ingestion Zone */}
                            <IngestionZone onFileAdd={handleFileAdd} onUrlAdd={handleUrlAdd} />

                            {/* Uploaded Files Preview */}
                            {uploadedFiles.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium mb-3">Queued for upload ({uploadedFiles.length})</h3>
                                    <div className="space-y-2">
                                        {uploadedFiles.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-md text-sm"
                                            >
                                                <span className="flex-1 truncate">{file.name}</span>
                                                <span className="text-muted-foreground text-xs">
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
