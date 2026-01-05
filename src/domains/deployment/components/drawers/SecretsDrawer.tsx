import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Lock } from "lucide-react";
import SecretsConfiguration from "../steps/SecretsConfiguration";

interface SecretsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    sequenceID: string;
    projectID: string;
    userID: string;
}

export function SecretsDrawer({ isOpen, onClose, sequenceID, projectID, userID }: SecretsDrawerProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        <Lock className="w-5 h-5" /> Secrets & Env Vars
                    </SheetTitle>
                    <SheetDescription>
                        Securely manage environment variables and API keys.
                    </SheetDescription>
                </SheetHeader>

                <div className="pb-10">
                    <SecretsConfiguration
                        sequenceID={sequenceID}
                        projectID={projectID}
                        userID={userID}
                        stepID="105"
                        onStepValidate={() => { }}
                        onNext={() => onClose()}
                        onPrevious={() => { }}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
