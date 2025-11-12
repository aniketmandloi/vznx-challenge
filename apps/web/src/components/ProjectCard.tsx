"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge, type ProjectStatus } from "@/components/StatusBadge";
import { Edit2, Trash2, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  id: number;
  name: string;
  status: ProjectStatus;
  progress: number;
  taskCount?: number;
  completedTasks?: number;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function ProjectCard({
  id,
  name,
  status,
  progress,
  taskCount = 0,
  completedTasks = 0,
  onClick,
  onEdit,
  onDelete,
  className,
}: ProjectCardProps) {
  return (
    <Card
      className={cn(
        "group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer",
        "border-2 hover:border-primary/50",
        className
      )}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="line-clamp-1">{name}</CardTitle>
        <CardAction>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit2 className="h-4 w-4" />
                <span className="sr-only">Edit project</span>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete project</span>
              </Button>
            )}
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <StatusBadge status={status} />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckSquare className="h-4 w-4" />
            <span>
              {completedTasks} / {taskCount} tasks
            </span>
          </div>
        </div>

        <ProgressBar value={progress} showLabel={true} />
      </CardContent>
    </Card>
  );
}
