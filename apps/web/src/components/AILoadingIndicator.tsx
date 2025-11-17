"use client";

import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AILoadingIndicatorProps {
  /**
   * Optional callback to cancel the AI generation
   */
  onCancel?: () => void;
  /**
   * Custom message to display (defaults to "Generating tasks with AI...")
   */
  message?: string;
}

/**
 * AILoadingIndicator Component
 *
 * Displays an animated loading state while AI tasks are being generated.
 * Features:
 * - Shimmer/pulse animation with Framer Motion
 * - "Generating tasks..." message
 * - Optional cancel button to abort AI request
 * - Professional design matching the app theme
 */
export function AILoadingIndicator({
  onCancel,
  message = "Generating tasks with AI...",
}: AILoadingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-8"
    >
      {/* Animated Icon */}
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkles className="h-12 w-12 text-primary" />
        </motion.div>

        {/* Spinning loader around the icon */}
        <motion.div
          className="absolute -inset-2"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Loader2 className="h-16 w-16 text-primary/30" />
        </motion.div>
      </div>

      {/* Message with shimmer effect */}
      <div className="space-y-2 text-center">
        <motion.p
          className="text-sm font-medium text-muted-foreground"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {message}
        </motion.p>
        <p className="text-xs text-muted-foreground/70">
          This usually takes 2-3 seconds
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-primary/60"
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Optional Cancel Button */}
      {onCancel && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="mt-2 text-xs"
        >
          Cancel
        </Button>
      )}
    </motion.div>
  );
}
