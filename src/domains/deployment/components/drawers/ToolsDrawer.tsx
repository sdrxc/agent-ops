import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Hammer } from "lucide-react";
import ToolConfiguration from "../steps/ToolConfiguration";

interface ToolsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    sequenceID: string;
    projectID: string;
    userID: string;
}

export function ToolsDrawer({ isOpen, onClose, sequenceID, projectID, userID }: ToolsDrawerProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        <Hammer className="w-5 h-5" /> Tools & Integrations
                    </SheetTitle>
                    <SheetDescription>
                        Grant your agent access to external APIs, databases, and services.
                    </SheetDescription>
                </SheetHeader>

                {/* Existing Step Component */}
                <div className="pb-10">
                    <ToolConfiguration
                        sequenceID={sequenceID}
                        projectID={projectID}
                        userID={userID}
                        stepID="102"
                        onStepValidate={() => { }}
                        onNext={() => {
                            // In drawer mode, "Next" might just close the drawer or show success
                            onClose();
                        }}
                        onPrevious={() => { }}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
