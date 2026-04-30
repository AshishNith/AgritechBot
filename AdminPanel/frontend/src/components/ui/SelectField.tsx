import type { SelectHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface Option {
  label: string;
  value: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
}

export const SelectField = ({ label, options, error, className, ...rest }: Props) => (
  <label className="flex w-full flex-col gap-1">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <select
      className={cn(
        "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring-2",
        error && "border-rose-500",
        className
      )}
      {...rest}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <span className="text-xs text-rose-600">{error}</span>}
  </label>
);

