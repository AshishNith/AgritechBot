import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextareaField = ({ label, error, className, ...rest }: Props) => (
  <label className="flex w-full flex-col gap-1">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <textarea
      className={cn(
        "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring-2",
        error && "border-rose-500",
        className
      )}
      {...rest}
    />
    {error && <span className="text-xs text-rose-600">{error}</span>}
  </label>
);

