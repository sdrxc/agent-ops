"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface EditableTitleProps {
    /** Current value of the title */
    value: string;
    /** Callback when value changes */
    onChange: (value: string) => void;
    /** Placeholder text when value is empty */
    placeholder?: string;
    /** Whether the input is read-only */
    readOnly?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Size variant */
    size?: "default" | "lg";
    /** Auto-focus the input on mount */
    autoFocus?: boolean;
}

/**
 * A reusable editable title component with an underline style.
 * Used for inline editing of titles like "New Prompt" or "New Collection".
 */
export const EditableTitle = forwardRef<HTMLInputElement, EditableTitleProps>(
    (
        {
            value,
            onChange,
            placeholder = "Untitled",
            readOnly = false,
            className,
            size = "default",
            autoFocus = false,
        },
        ref
    ) => {
        return (
            <Input
                ref={ref}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                readOnly={readOnly}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className={cn(
                    // Base styles
                    "bg-transparent shadow-none p-0 pb-1 border-0 border-b-2 rounded-none",
                    "focus-visible:ring-0 h-auto font-normal text-foreground leading-8",
                    "transition-colors duration-200",
                    // Hover state for editable titles
                    !readOnly && "hover:border-primary/50",
                    // Size variants
                    size === "default" && "text-[1.5rem] md:text-[1.5rem] max-w-xs",
                    size === "lg" && "text-[2rem] md:text-[2rem] max-w-md",
                    // Read-only state
                    readOnly && "cursor-default border-transparent",
                    className
                )}
            />
        );
    }
);

EditableTitle.displayName = "EditableTitle";
