"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type TaskStatus = "incomplete" | "complete";

interface TaskItemProps {
  id: number;
  name: string;
  status: TaskStatus;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  onToggleStatus?: (id: number, newStatus: TaskStatus) => void;
  onDelete?: (id: number) => void;
  className?: string;
}

export function TaskItem({
  id,
  name,
  status,
  assignedTo,
  onToggleStatus,
  onDelete,
  className,
}: TaskItemProps) {
  const [isChecked, setIsChecked] = useState(status === "complete");

  const handleToggle = () => {
    const newStatus: TaskStatus = isChecked ? "incomplete" : "complete";
    setIsChecked(!isChecked);
    onToggleStatus?.(id, newStatus);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border p-3 transition-all",
        "hover:shadow-md hover:border-primary/50",
        isChecked && "bg-muted/50",
        className
      )}
    >
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
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">
              {assignedTo.name || assignedTo.email}
            </span>
          </div>
        )}
      </div>

      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
          onClick={() => onDelete(id)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete task</span>
        </Button>
      )}
    </div>
  );
}
