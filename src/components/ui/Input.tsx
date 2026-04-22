import React, { forwardRef } from "react";

interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  size?: "sm" | "md" | "lg";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = "",
      containerClassName = "",
      size = "md", // Default size
      ...props
    },
    ref,
  ) => {
    // Size variants configuration
    const sizeClasses = {
      sm: "py-1.5 text-xs",
      md: "py-2 text-sm",
      lg: "py-3 text-sm",
    };

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className="block text-[10px] font-black text-muted-foreground mb-2 px-1 uppercase tracking-widest opacity-80">
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              block w-full rounded-2xl border border-border/30 shadow-inner
              bg-secondary/20 text-foreground placeholder:text-muted-foreground/40
              focus:ring-4 focus:ring-primary/5 focus:border-primary/20 
              disabled:opacity-50 disabled:cursor-not-allowed
              outline-none transition-all duration-300 font-bold
              ${sizeClasses[size]}
              ${leftIcon ? "pl-12" : "pl-4"}
              ${rightIcon ? "pr-12" : "pr-4"}
              ${
                error
                  ? "border-destructive/30 text-destructive placeholder-destructive/30 focus:ring-destructive/5 focus:border-destructive/20"
                  : ""
              }
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-[10px] font-bold text-destructive uppercase tracking-widest ml-1">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 opacity-60">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
