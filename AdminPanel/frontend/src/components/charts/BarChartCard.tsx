import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { Card } from "../ui/Card";

interface Props {
  title: string;
  data: Array<{ label: string; value: number }>;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export const BarChartCard = ({ title, data, color = "#10b981", gradientFrom = "#10b981", gradientTo = "#059669" }: Props) => (
  <Card title={title}>
    <div className="h-72 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientFrom} stopOpacity={0.9} />
              <stop offset="100%" stopColor={gradientTo} stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              fontSize: "12px",
              fontWeight: "600",
              color: "#0f172a"
            }}
            cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
          />
          <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} maxBarSize={45} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Card>
);
