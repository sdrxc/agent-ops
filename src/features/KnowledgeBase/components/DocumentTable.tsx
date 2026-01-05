"use client";

import { KnowledgeDocument } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Search, FileText, Link2, Terminal, Box } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DocumentTableProps {
  documents: KnowledgeDocument[];
  onDelete: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function DocumentTable({
  documents,
  onDelete,
  searchTerm,
  onSearchChange,
}: DocumentTableProps) {
  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status: KnowledgeDocument["status"]) => {
    switch (status) {
      case "Ready":
        return "default";
      case "Indexing":
        return "secondary";
      case "Error":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Chunks</TableHead>
              <TableHead>MCP Tools</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? (
                    <p>No documents found matching &quot;{searchTerm}&quot;</p>
                  ) : (
                    <p>No documents in this collection yet.</p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {document.type === "url" ? (
                        <Link2 className="size-4 text-muted-foreground" />
                      ) : (
                        <FileText className="size-4 text-muted-foreground" />
                      )}
                      <span className="truncate max-w-[200px]" title={document.name}>
                        {document.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground uppercase">
                      {document.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(document.status)}>
                      {document.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {document.size || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {document.chunks.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      {document.mcpEndpoints && document.mcpEndpoints.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Terminal className="size-3" />
                          <span className="truncate max-w-[150px]" title={document.mcpEndpoints.join(", ")}>
                            {document.mcpEndpoints.length} endpoint{document.mcpEndpoints.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                      {document.tools && document.tools.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Box className="size-3" />
                          <span className="truncate max-w-[150px]" title={document.tools.map(t => t.name).join(", ")}>
                            {document.tools.length} tool{document.tools.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                      {(!document.mcpEndpoints?.length && !document.tools?.length) && (
                        <span className="text-xs text-muted-foreground italic">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(document.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Remove this document from the collection?")) {
                          onDelete(document.id);
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}















