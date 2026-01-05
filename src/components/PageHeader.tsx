"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonConfig {
  href?: string;
  label?: string;
  onClick?: () => void;
}

interface EditableTitleConfig {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

interface PageHeaderProps {
  title?: string | ReactNode;
  description?: string | ReactNode;
  actions?: ReactNode;
  className?: string;
  backButton?: BackButtonConfig;
  editableTitle?: EditableTitleConfig;
}

export function PageHeader({ title, description, actions, className, backButton, editableTitle }: PageHeaderProps) {
  const router = useRouter();

  const handleBackClick = () => {
    if (backButton?.onClick) {
      backButton.onClick();
    } else if (backButton?.href) {
      router.push(backButton.href);
    } else {
      router.back();
    }
  };

  const renderTitle = () => {
    if (editableTitle) {
      return (
        <Input
          type="text"
          value={editableTitle.value}
          onChange={(e) => editableTitle.onChange(e.target.value)}
          readOnly={editableTitle.readOnly}
          placeholder={editableTitle.placeholder}
          className={cn(
            "bg-transparent shadow-none p-0 pb-1 border-0 border-b-2 rounded-none focus-visible:ring-0 max-w-xs h-auto font-normal text-[1.5rem] text-foreground md:text-[1.5rem] leading-8",
            editableTitle.readOnly ? "cursor-default" : ""
          )}
        />
      );
    }
    
    if (title) {
      return typeof title === "string" ? (
        <h1 className="font-normal text-foreground text-2xl">{title}</h1>
      ) : (
        <div className="font-normal text-foreground text-2xl">{title}</div>
      );
    }
    
    return null;
  };

  const headerContent = (
    <div className={cn("flex md:flex-row flex-col md:justify-between gap-4", className)}>
      <div className="flex-1">
        {renderTitle()}
        {description && (
          <div className="mt-1 text-muted-foreground text-sm">{description}</div>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );

  if (backButton) {
    return (
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackClick}
          className="hover:bg-slate-200 mt-0.5 -ml-2 p-2 rounded-lg text-slate-500 hover:text-slate-900 transition-colors shrink-0"
          title={backButton.label || "Back"}
          aria-label={backButton.label || "Back"}
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1 min-w-0">
          {headerContent}
        </div>
      </div>
    );
  }

  return headerContent;
}



