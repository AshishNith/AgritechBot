import { cn } from "../../utils/cn";

interface Props {
  children: string;
  tone?: "green" | "red" | "amber" | "slate" | "blue";
}

const styles = {
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-rose-100 text-rose-700",
  amber: "bg-amber-100 text-amber-700",
  slate: "bg-slate-100 text-slate-700",
  blue: "bg-blue-100 text-blue-700"
};

export const Badge = ({ children, tone = "slate" }: Props) => (
  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", styles[tone])}>{children}</span>
);

