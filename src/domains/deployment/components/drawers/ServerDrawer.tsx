import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Server } from "lucide-react";
import ServerConfiguration from "../steps/ServerConfiguration";

interface ServerDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    sequenceID: string;
    projectID: string;
    userID: string;
}

export function ServerDrawer({ isOpen, onClose, sequenceID, projectID, userID }: ServerDrawerProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        <Server className="w-5 h-5" /> Server Configuration
                    </SheetTitle>
                    <SheetDescription>
                        Select the compute resources where your agent will run.
                    </SheetDescription>
                </SheetHeader>

                <div className="pb-10">
                    <ServerConfiguration
                        sequenceID={sequenceID}
                        projectID={projectID}
                        userID={userID}
                        stepID="103"
                        onStepValidate={() => { }}
                        onNext={() => onClose()}
                        onPrevious={() => { }}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
