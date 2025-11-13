"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { transitions } from "@/lib/animations";
import { Circle } from "lucide-react";

export type ProjectStatus =
  | "planning"
  | "in-progress"
  | "completed"
  | "on-hold";

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
  animated?: boolean;
  showIcon?: boolean;
}

const statusConfig = {
  planning: {
    label: "Planning",
    className:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    iconColor: "text-blue-500",
    shouldPulse: false,
  },
  "in-progress": {
    label: "In Progress",
    className:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
    iconColor: "text-orange-500",
    shouldPulse: true,
  },
  completed: {
    label: "Completed",
    className:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    iconColor: "text-green-500",
    shouldPulse: false,
  },
  "on-hold": {
    label: "On Hold",
    className:
      "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    iconColor: "text-gray-500",
    shouldPulse: false,
  },
} as const;

export function StatusBadge({
  status,
  className,
  animated = true,
  showIcon = true,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const [prevStatus, setPrevStatus] = React.useState(status);

  React.useEffect(() => {
    if (status !== prevStatus) {
      setPrevStatus(status);
    }
  }, [status, prevStatus]);

  if (!animated) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "font-medium transition-colors",
          config.className,
          className
        )}
      >
        {showIcon && (
          <Circle className={cn("h-2 w-2 fill-current", config.iconColor)} />
        )}
        {config.label}
      </Badge>
    );
  }

  return (
    <motion.div
      className="inline-block"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={transitions.spring}
      layout
    >
      <Badge
        variant="outline"
        className={cn(
          "font-medium transition-colors relative",
          config.className,
          className
        )}
      >
        {/* Icon with pulse animation for "in-progress" */}
        {showIcon && (
          <motion.div
            className="relative inline-flex"
            animate={
              config.shouldPulse
                ? {
                    scale: [1, 1.2, 1],
                  }
                : {}
            }
            transition={
              config.shouldPulse
                ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                : undefined
            }
          >
            <Circle className={cn("h-2 w-2 fill-current", config.iconColor)} />

            {/* Pulse ring for "in-progress" */}
            {config.shouldPulse && (
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{
                  border: `2px solid currentColor`,
                }}
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </motion.div>
        )}

        {/* Label with color morph animation */}
        <motion.span
          key={status}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.fast}
        >
          {config.label}
        </motion.span>

        {/* Shimmer effect on status change */}
        {status !== prevStatus && (
          <motion.div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="h-full w-full bg-white/50"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </Badge>
    </motion.div>
  );
}
