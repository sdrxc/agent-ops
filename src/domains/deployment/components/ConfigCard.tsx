import { LucideIcon, Check, Settings2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfigCardProps {
    title: string;
    description?: string;
    icon: LucideIcon;
    status: "ready" | "missing" | "optional" | "incomplete";
    children?: React.ReactNode;
    onEdit: () => void;
    className?: string;
}

export function ConfigCard({ title, description, icon: Icon, status, children, onEdit, className }: ConfigCardProps) {

    const statusColor = {
        ready: "text-green-600 bg-green-50 border-green-200",
        missing: "text-red-500 bg-red-50 border-red-200",
        optional: "text-gray-500 bg-gray-50 border-gray-200",
        incomplete: "text-amber-500 bg-amber-50 border-amber-200"
    };

    const StatusIcon = {
        ready: Check,
        missing: AlertTriangle,
        optional: Settings2,
        incomplete: AlertTriangle
    }[status];

    return (
        <Card className={cn("group relative overflow-hidden transition-all duration-200 hover:shadow-md border-l-4",
            status === 'missing' ? 'border-l-red-500' :
                status === 'ready' ? 'border-l-green-500' :
                    status === 'incomplete' ? 'border-l-amber-500' : 'border-l-gray-300',
            className
        )}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg", statusColor[status])}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {title}
                </CardTitle>
                <div className={cn("text-xs font-medium px-2 py-1 rounded-full uppercase tracking-wider", statusColor[status])}>
                    {status}
                </div>
            </CardHeader>
            <CardContent>
                {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
                <div className="text-sm">
                    {children}
                </div>
            </CardContent>
            <CardFooter className="pt-0">
                <Button variant="outline" size="sm" onClick={onEdit} className="w-full group-hover:bg-gray-50 group-hover:text-primary transition-colors">
                    Configure
                </Button>
            </CardFooter>
        </Card>
    );
}
