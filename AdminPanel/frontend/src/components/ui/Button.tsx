import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
  leftIcon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100"
};

export const Button = ({
  children,
  className,
  variant = "primary",
  isLoading = false,
  leftIcon,
  disabled,
  ...rest
}: Props) => (
  <button
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
      variantClasses[variant],
      className
    )}
    disabled={disabled || isLoading}
    {...rest}
  >
    {leftIcon}
    {isLoading ? "Please wait..." : children}
  </button>
);

