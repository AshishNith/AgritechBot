import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface Props {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const Card = ({ title, description, action, children, className }: Props) => (
  <section className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
    {(title || action) && (
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

