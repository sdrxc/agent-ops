"use client";

import * as React from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: "input" | "textarea";
  minRows?: number;
  maxRows?: number;
  className?: string;
  startActions?: React.ReactNode;
  endActions?: React.ReactNode;
  showSendButton?: boolean;
  sendButtonLabel?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Type a message...",
  disabled = false,
  isLoading = false,
  variant = "textarea",
  minRows = 1,
  maxRows,
  className,
  startActions,
  endActions,
  showSendButton = true,
  sendButtonLabel,
  onKeyDown,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (onSubmit && !disabled && !isLoading && value.trim()) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (onSubmit && !disabled && !isLoading && value.trim()) {
      onSubmit();
    }
  };

  const isDisabled = disabled || isLoading;
  const canSubmit = !isDisabled && value.trim();

  return (
    <InputGroup className={cn("rounded-2xl", className)}>
      {variant === "textarea" ? (
        <InputGroupTextarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={minRows}
          className={cn(
            "min-h-[44px] resize-none",
            maxRows && "max-h-[200px]"
          )}
        />
      ) : (
        <InputGroupInput
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
        />
      )}

      {(startActions || endActions || showSendButton) && (
        <InputGroupAddon align={variant === "textarea" ? "block-end" : "inline-end"}>
          <div className="flex justify-between items-center w-full gap-2">
            {startActions && <div className="flex items-center gap-1">{startActions}</div>}

            <div className="flex items-center gap-1 ml-auto">
              {endActions && <div className="flex items-center gap-1">{endActions}</div>}

              {showSendButton && (
                <InputGroupButton
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  size="sm"
                  variant="default"
                  className="rounded-full"
                  aria-label={sendButtonLabel || "Send message"}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                  {sendButtonLabel && <span className="sr-only">{sendButtonLabel}</span>}
                </InputGroupButton>
              )}
            </div>
          </div>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

