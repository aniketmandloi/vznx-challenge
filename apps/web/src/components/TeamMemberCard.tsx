"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMemberCardProps {
  id: string;
  name: string;
  email: string;
  taskCount: number;
  maxCapacity?: number; // Default to 5 tasks
  onClick?: () => void;
  className?: string;
}

export function TeamMemberCard({
  id,
  name,
  email,
  taskCount,
  maxCapacity = 5,
  onClick,
  className,
}: TeamMemberCardProps) {
  // Calculate capacity percentage
  const capacityPercentage = Math.min((taskCount / maxCapacity) * 100, 100);

  // Determine workload level and colors
  const getWorkloadConfig = (percentage: number) => {
    if (percentage >= 91) {
      return {
        level: "Overloaded",
        color: "text-red-600 dark:text-red-400",
        badgeClass:
          "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
        progressClass: "bg-red-500",
      };
    }
    if (percentage >= 71) {
      return {
        level: "Busy",
        color: "text-orange-600 dark:text-orange-400",
        badgeClass:
          "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
        progressClass: "bg-orange-500",
      };
    }
    return {
      level: "Healthy",
      color: "text-green-600 dark:text-green-400",
      badgeClass:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
      progressClass: "bg-green-500",
    };
  };

  const workloadConfig = getWorkloadConfig(capacityPercentage);

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-lg",
        onClick && "cursor-pointer hover:scale-[1.02] hover:border-primary/50",
        className
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{name}</CardTitle>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {email}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={workloadConfig.badgeClass}>
            {workloadConfig.level}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tasks assigned</span>
          <span className={cn("font-semibold", workloadConfig.color)}>
            {taskCount} / {maxCapacity}
          </span>
        </div>

        <div className="space-y-2">
          <Progress
            value={capacityPercentage}
            className="h-2"
            indicatorClassName={cn(
              "transition-all duration-500",
              workloadConfig.progressClass
            )}
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Capacity</span>
            <span
              className={cn("font-semibold tabular-nums", workloadConfig.color)}
            >
              {Math.round(capacityPercentage)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
