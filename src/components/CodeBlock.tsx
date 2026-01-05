import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
    code: string;
    className?: string;
    compact?: boolean;
}

export function CodeBlock({ code, className, compact = false }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className={cn(
                "bg-slate-950 text-slate-50 rounded-md font-mono overflow-x-auto group",
                compact ? "text-xs p-2" : "text-sm p-3",
                className
            )}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-start gap-2">
                <code className={compact ? "truncate" : ""}>{code}</code>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "text-slate-400 hover:text-slate-50 shrink-0",
                        compact ? "h-4 w-4" : "h-6 w-6"
                    )}
                    onClick={handleCopy}
                    title="Copy to clipboard"
                >
                    {copied ? (
                        <Check className={cn(compact ? "size-3" : "size-4", "text-green-500")} />
                    ) : (
                        <Copy className={compact ? "size-3" : "size-4"} />
                    )}
                </Button>
            </div>
        </div>
    );
}
