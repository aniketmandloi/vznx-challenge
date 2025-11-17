import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { shakeVariants } from "@/lib/animations";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  animated?: boolean;
  error?: boolean;
  showCounter?: boolean;
}

function Textarea({
  className,
  animated = true,
  error = false,
  showCounter = false,
  ...props
}: TextareaProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [charCount, setCharCount] = React.useState(
    props.value?.toString().length || props.defaultValue?.toString().length || 0
  );

  const maxLength = props.maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
    props.onChange?.(e);
  };

  if (!animated) {
    const textareaElement = (
      <textarea
        data-slot="textarea"
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
        onChange={showCounter ? handleChange : props.onChange}
      />
    );

    if (showCounter && maxLength) {
      return (
        <div className="relative">
          {textareaElement}
          <div className="absolute bottom-2 right-3 text-xs text-muted-foreground pointer-events-none">
            {charCount}/{maxLength}
          </div>
        </div>
      );
    }

    return textareaElement;
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

  const textareaElement = (
    <motion.textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "transition-[color,box-shadow,border-color] duration-200",
        error && "border-destructive",
        showCounter && maxLength && "pb-7",
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
      onChange={showCounter ? handleChange : props.onChange}
    />
  );

  if (showCounter && maxLength) {
    return (
      <div className="relative">
        {textareaElement}
        <motion.div
          className="absolute bottom-2 right-3 text-xs pointer-events-none"
          animate={{
            color:
              charCount > maxLength * 0.9
                ? "var(--color-destructive)"
                : "var(--color-muted-foreground)",
          }}
        >
          {charCount}/{maxLength}
        </motion.div>
      </div>
    );
  }

  return textareaElement;
}

export { Textarea };
