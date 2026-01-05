import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { GitBranch } from "lucide-react";
import CodeRepository from "../steps/CodeRepository";

interface CodeDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    sequenceID: string;
    projectID: string;
    userID: string;
}

export function CodeDrawer({ isOpen, onClose, sequenceID, projectID, userID }: CodeDrawerProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        <GitBranch className="w-5 h-5" /> Code Repository
                    </SheetTitle>
                    <SheetDescription>
                        Connect your source code provider (GitHub/GitLab) to sync agent logic.
                    </SheetDescription>
                </SheetHeader>

                <div className="pb-10">
                    <CodeRepository
                        sequenceID={sequenceID}
                        projectID={projectID}
                        userID={userID}
                        stepID="104"
                        onStepValidate={() => { }}
                        onNext={() => onClose()}
                        onPrevious={() => { }}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
