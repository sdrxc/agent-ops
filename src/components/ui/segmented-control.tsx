"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";

interface SegmentedControlProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "value" | "dir"> {
  /** The controlled value of the selected item */
  value?: string;
  /** The default value when uncontrolled */
  defaultValue?: string;
  /** Callback when value changes */
  onValueChange?: (value: string) => void;
  /** Whether the control is disabled */
  disabled?: boolean;
  /** Reading direction */
  dir?: "ltr" | "rtl";
}

const SegmentedControl = React.forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(({ className, children, ...props }, ref) => {
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      type="single"
      className={cn(
        "inline-flex items-center gap-2 overflow-x-auto",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Root>
  );
});
SegmentedControl.displayName = "SegmentedControl";

interface SegmentedControlItemProps
  extends React.ComponentProps<typeof ToggleGroupPrimitive.Item> {}

const SegmentedControlItem = React.forwardRef<
  HTMLButtonElement,
  SegmentedControlItemProps
>(({ className, children, ...props }, ref) => {
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        // Base styles - pill shaped
        "inline-flex items-center justify-center whitespace-nowrap font-medium",
        "h-8 px-3 text-sm rounded-full transition-all duration-200",
        "select-none outline-none",
        // Focus
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-50",
        // Unselected state
        "bg-transparent text-slate-500 hover:text-slate-700",
        // Selected state
        "data-[state=on]:bg-white data-[state=on]:text-slate-900 data-[state=on]:shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});
SegmentedControlItem.displayName = "SegmentedControlItem";

export { SegmentedControl, SegmentedControlItem };

