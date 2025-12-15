"use client";

import * as React from "react";
import { motion, MotionProps } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ============ Base Container ============
interface ContentCardProps extends React.ComponentProps<typeof Card> {
  animated?: boolean;
  animationConfig?: {
    whileHover?: MotionProps["whileHover"];
    transition?: MotionProps["transition"];
  };
}

const ContentCard = React.forwardRef<HTMLDivElement, ContentCardProps>(
  (
    { children, className, animated = true, animationConfig, ...props },
    ref
  ) => {
    const defaultAnimationConfig = {
      whileHover: { scale: 1.03 },
      transition: { type: "spring" as const, stiffness: 200, damping: 12 },
    };

    const finalAnimationConfig = animationConfig || defaultAnimationConfig;

    if (animated) {
      return (
        <motion.div
          whileHover={finalAnimationConfig.whileHover}
          transition={finalAnimationConfig.transition}
        >
          <Card
            ref={ref}
            className={cn(
              "h-full hover:shadow-xl transition-shadow flex flex-col",
              className
            )}
            {...props}
          >
            {children}
          </Card>
        </motion.div>
      );
    }

    return (
      <Card
        ref={ref}
        className={cn(
          "h-full hover:shadow-xl transition-shadow flex flex-col",
          className
        )}
        {...props}
      >
        {children}
      </Card>
    );
  }
);
ContentCard.displayName = "ContentCard";

export { ContentCard };
export type { ContentCardProps };
