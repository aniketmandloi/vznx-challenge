/**
 * TaskItem Component
 *
 * Individual task card with:
 * - Drag handle for reordering (appears on hover)
 * - Checkbox to toggle completion status
 * - Strike-through text when completed
 * - Celebration animation (sparkles + scale) on completion
 * - Optional assigned user display
 * - Delete button (appears on hover)
 * - Smooth animations and transitions
 */
"use client";

import { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, GripVertical, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export type TaskStatus = "incomplete" | "complete";

interface TaskItemProps {
  id: number;
  name: string;
  status: TaskStatus;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  onToggleStatus?: (id: number) => void;
  onDelete?: (id: number) => void;
  className?: string;
  isDragEnabled?: boolean;
}

export function TaskItem({
  id,
  name,
  status,
  assignedTo,
  onToggleStatus,
  onDelete,
  className,
  isDragEnabled = true,
}: TaskItemProps) {
  const [isChecked, setIsChecked] = useState(status === "complete");
  const [showCelebration, setShowCelebration] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    disabled: !isDragEnabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Trigger celebration when task is completed
  useEffect(() => {
    if (isChecked && status === "incomplete") {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isChecked, status]);

  const handleToggle = () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);

    // Show celebration only when completing a task (not uncompleting)
    if (newChecked) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 500);
    }

    onToggleStatus?.(id);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 rounded-lg border p-3 transition-all relative overflow-hidden",
        "hover:shadow-md hover:border-primary/50",
        isChecked && "bg-muted/50",
        isDragging && "opacity-50 shadow-lg z-50",
        className
      )}
      animate={
        showCelebration
          ? {
              scale: [1, 1.02, 1],
              borderColor: [
                "hsl(var(--border))",
                "hsl(var(--primary))",
                "hsl(var(--border))",
              ],
            }
          : {}
      }
      transition={{ duration: 0.3 }}
    >
      {/* Celebration Effect */}
      <AnimatePresence>
        {showCelebration && (
          <>
            {/* Sparkle particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  x: "50%",
                  y: "50%",
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: `${50 + Math.cos((i * Math.PI) / 3) * 100}%`,
                  y: `${50 + Math.sin((i * Math.PI) / 3) * 100}%`,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Sparkles className="h-3 w-3 text-primary" />
              </motion.div>
            ))}
            {/* Success ring */}
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-primary pointer-events-none"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.1, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Drag Handle */}
      {isDragEnabled && (
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab active:cursor-grabbing touch-none md:opacity-0 md:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-2 min-h-11 min-w-11 flex items-center justify-center"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>
      )}

      <Checkbox
        checked={isChecked}
        onCheckedChange={handleToggle}
        className="shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium transition-all duration-300",
            isChecked && "line-through text-muted-foreground"
          )}
        >
          {name}
        </p>
        {assignedTo && (
          <div className="flex items-center gap-2 mt-1.5">
            <Avatar className="h-5 w-5">
              <AvatarImage
                src={assignedTo.image || undefined}
                alt={assignedTo.name}
              />
              <AvatarFallback className="text-[9px] bg-muted">
                {assignedTo.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {assignedTo.name || assignedTo.email}
            </span>
          </div>
        )}
      </div>

      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
          onClick={() => onDelete(id)}
          aria-label="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
}
