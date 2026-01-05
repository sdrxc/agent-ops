import { KnowledgeCollection } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Terminal, Box } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CodeBlock } from "@/components/CodeBlock";

interface IntegrationDetailsProps {
    collection: KnowledgeCollection;
}

export function IntegrationDetails({ collection }: IntegrationDetailsProps) {
    if (!collection.mcpEndpoints?.length && !collection.tools?.length) {
        return null;
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Terminal className="size-5 text-primary" />
                    Integration Details
                </CardTitle>
                <CardDescription>
                    Connect to this knowledge source using the MCP protocol.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* MCP Endpoints */}
                {collection.mcpEndpoints && collection.mcpEndpoints.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium mb-2">MCP Endpoint</h4>
                        <CodeBlock code={collection.mcpEndpoints[0]} compact />
                        {collection.mcpEndpoints.length > 1 && (
                            <p className="text-xs text-muted-foreground mt-1">
                                + {collection.mcpEndpoints.length - 1} more endpoints available
                            </p>
                        )}
                    </div>
                )}

                {/* Tools Table */}
                {collection.tools && collection.tools.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Box className="size-4" />
                            Available Tools
                        </h4>
                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[180px]">Name</TableHead>
                                        <TableHead>Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {collection.tools.map((tool, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-mono text-xs font-semibold">
                                                {tool.name}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{tool.description}</div>
                                                {tool.usage && (
                                                    <div className="mt-2">
                                                        <CodeBlock code={tool.usage} compact />
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
