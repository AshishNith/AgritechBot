import { Card } from "../ui/Card";

interface Props {
  label: string;
  value: string;
  subtitle?: string;
}

export const MetricCard = ({ label, value, subtitle }: Props) => (
  <Card>
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
  </Card>
);

