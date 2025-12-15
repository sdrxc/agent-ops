"use client";

import * as React from "react";
import { CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ============ Footer ============
interface ContentCardFooterProps extends React.ComponentProps<typeof CardFooter> {
  layout?: "single" | "double" | "triple" | "flex";
}

const ContentCardFooter = React.forwardRef<
  HTMLDivElement,
  ContentCardFooterProps
>(({ className, layout = "single", children, ...props }, ref) => {
  const layoutClasses = {
    single: "justify-end",
    double: "grid grid-cols-2 gap-3",
    triple: "grid grid-cols-3 gap-2",
    flex: "flex gap-2",
  };

  return (
    <CardFooter
      ref={ref}
      className={cn("mt-auto", layoutClasses[layout], className)}
      {...props}
    >
      {children}
    </CardFooter>
  );
});
ContentCardFooter.displayName = "ContentCardFooter";

export { ContentCardFooter };
export type { ContentCardFooterProps };
