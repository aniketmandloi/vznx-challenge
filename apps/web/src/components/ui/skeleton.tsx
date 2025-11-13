import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-accent/50 animate-pulse rounded-md motion-reduce:animate-none",
        className
      )}
      aria-busy="true"
      aria-live="polite"
      {...props}
    />
  );
}

export { Skeleton };
