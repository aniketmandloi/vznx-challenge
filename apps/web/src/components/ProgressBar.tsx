"use client";

import * as React from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { transitions } from "@/lib/animations";

interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
  showGlow?: boolean;
  showShimmer?: boolean;
}

export function ProgressBar({
  value,
  showLabel = true,
  className,
  animated = true,
  showGlow = true,
  showShimmer = true,
}: ProgressBarProps) {
  // Ensure value is between 0 and 100
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  // Animated counter
  const springValue = useSpring(0, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const displayValue = useTransform(springValue, (latest) =>
    Math.round(latest)
  );

  React.useEffect(() => {
    springValue.set(normalizedValue);
  }, [normalizedValue, springValue]);

  // Color logic based on completion percentage
  const getColorClass = (percentage: number): string => {
    if (percentage < 30) return "bg-red-500";
    if (percentage < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getTextColorClass = (percentage: number): string => {
    if (percentage < 30) return "text-red-500";
    if (percentage < 70) return "text-yellow-600";
    return "text-green-600";
  };

  const colorClass = getColorClass(normalizedValue);
  const textColorClass = getTextColorClass(normalizedValue);

  // Glow effect when complete
  const isComplete = normalizedValue >= 100;

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="relative">
        {/* Base Progress */}
        <Progress
          value={normalizedValue}
          className="h-2"
          indicatorClassName={cn(
            "transition-all duration-500 ease-in-out",
            colorClass,
            animated && "motion-safe:transition-transform",
            showGlow && isComplete && "shadow-lg animate-pulse"
          )}
        />

        {/* Shimmer Overlay */}
        {animated &&
          showShimmer &&
          normalizedValue > 0 &&
          normalizedValue < 100 && (
            <motion.div
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="h-full w-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                  backgroundSize: "200% 100%",
                }}
                animate={{
                  backgroundPosition: ["200% 0", "-200% 0"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.div>
          )}

        {/* Glow Effect on Completion */}
        {animated && showGlow && isComplete && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-full"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background: `radial-gradient(circle, ${
                normalizedValue >= 70
                  ? "rgba(34, 197, 94, 0.3)"
                  : normalizedValue >= 30
                  ? "rgba(234, 179, 8, 0.3)"
                  : "rgba(239, 68, 68, 0.3)"
              }, transparent)`,
              filter: "blur(8px)",
            }}
          />
        )}
      </div>

      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>

          {animated ? (
            <motion.span
              className={cn("font-semibold tabular-nums", textColorClass)}
              initial={{ scale: 1 }}
              animate={
                isComplete
                  ? {
                      scale: [1, 1.2, 1],
                    }
                  : {}
              }
              transition={{
                duration: 0.5,
                ease: "easeOut",
              }}
            >
              <motion.span>{displayValue}</motion.span>%
            </motion.span>
          ) : (
            <span className={cn("font-semibold tabular-nums", textColorClass)}>
              {normalizedValue}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
