"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/tables/DataTable";
import { KnowledgeCollection } from "@/types/api";
import { Folder, Terminal, Box } from "lucide-react";

// Column definitions for KnowledgeCollection
const columns: ColumnDef<KnowledgeCollection>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            const collection = row.original;
            return (
                <div className="flex items-center gap-3">
                    <div className="flex justify-center items-center bg-primary/10 p-2 rounded-md">
                        <Folder className="size-4 text-primary" />
                    </div>
                    <div>
                        <div className="font-medium text-foreground">
                            {collection.name}
                        </div>
                        {collection.category && (
                            <div className="mt-0.5 text-muted-foreground text-xs">
                                {collection.category}
                            </div>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <div
                className="max-w-[300px] text-muted-foreground text-sm line-clamp-2"
                title={row.original.description}
            >
                {row.original.description}
            </div>
        ),
    },
    {
        accessorKey: "documentCount",
        header: "Items",
        cell: ({ row }) => (
            <Badge variant="secondary" className="font-normal whitespace-nowrap">
                {row.original.documentCount} items
            </Badge>
        ),
    },
    {
        accessorKey: "totalSize",
        header: "Size",
        cell: ({ row }) => (
            <span className="font-mono text-muted-foreground text-sm whitespace-nowrap">
                {row.original.totalSize}
            </span>
        ),
    },
    {
        id: "tools",
        header: "Tools",
        cell: ({ row }) => {
            const collection = row.original;
            const hasMcpEndpoints = collection.mcpEndpoints && collection.mcpEndpoints.length > 0;
            const hasTools = collection.tools && collection.tools.length > 0;

            if (!hasMcpEndpoints && !hasTools) {
                return <span className="text-muted-foreground text-xs italic">—</span>;
            }

            return (
                <div className="flex flex-col gap-2">
                    {/* MCP Endpoints (URLs) */}
                    {hasMcpEndpoints && (
                        <div className="flex flex-col gap-1">
                            {collection.mcpEndpoints!.map((endpoint, i) => (
                                <div key={i} className="flex items-center gap-1.5 font-mono text-muted-foreground text-xs">
                                    <Terminal className="size-3 shrink-0" />
                                    <span className="max-w-[250px] truncate" title={endpoint}>
                                        {endpoint}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Tools (badges like cards) */}
                    {hasTools && (
                        <div className="flex flex-wrap gap-1.5">
                            {collection.tools!.map((tool, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1 bg-primary/10 px-2 py-1 border border-primary/20 rounded text-primary text-xs"
                                    title={tool.description}
                                >
                                    <Box className="size-3" />
                                    {tool.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "updated",
        header: "Updated",
        cell: ({ row }) => (
            <span className="text-muted-foreground text-sm whitespace-nowrap">
                {new Date(row.original.updated).toLocaleDateString()}
            </span>
        ),
    },
];

interface CollectionListTableProps {
    collections: KnowledgeCollection[];
    onSelect: (id: string) => void;
}

export function CollectionListTable({ collections, onSelect }: CollectionListTableProps) {
    return (
        <DataTable
            columns={columns}
            data={collections}
            onRowClick={(row) => onSelect(row.id)}
        />
    );
}
