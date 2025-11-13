import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { shakeVariants } from "@/lib/animations";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  animated?: boolean;
  error?: boolean;
}

function Textarea({
  className,
  animated = true,
  error = false,
  ...props
}: TextareaProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  if (!animated) {
    return (
      <textarea
        data-slot="textarea"
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />
    );
  }

  const animateProps = error
    ? {
        variants: shakeVariants,
        initial: "initial" as const,
        animate: "shake" as const,
      }
    : {
        animate: {
          borderColor: isFocused
            ? "var(--color-primary)"
            : "var(--color-border)",
          boxShadow: isFocused
            ? "0 0 0 3px var(--color-primary / 0.1)"
            : "none",
        },
      };

  return (
    <motion.textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "transition-[color,box-shadow,border-color] duration-200",
        error && "border-destructive",
        className
      )}
      onFocus={(e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(false);
        props.onBlur?.(e);
      }}
      transition={{ duration: 0.2 }}
      {...animateProps}
      {...(props as any)}
    />
  );
}

export { Textarea };
