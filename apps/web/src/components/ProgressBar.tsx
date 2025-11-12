import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  showLabel = true,
  className,
}: ProgressBarProps) {
  // Ensure value is between 0 and 100
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  // Color logic based on completion percentage
  const getColorClass = (percentage: number): string => {
    if (percentage < 30) return "bg-red-500";
    if (percentage < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const colorClass = getColorClass(normalizedValue);

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="relative">
        <Progress
          value={normalizedValue}
          className="h-2"
          indicatorClassName={cn(
            "transition-all duration-500 ease-in-out",
            colorClass
          )}
        />
      </div>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span
            className={cn(
              "font-semibold tabular-nums",
              normalizedValue < 30 && "text-red-500",
              normalizedValue >= 30 &&
                normalizedValue < 70 &&
                "text-yellow-600",
              normalizedValue >= 70 && "text-green-600"
            )}
          >
            {normalizedValue}%
          </span>
        </div>
      )}
    </div>
  );
}
