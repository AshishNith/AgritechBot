import { ResponsiveContainer, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from "recharts";
import { Card } from "../ui/Card";

interface Props {
  title: string;
  data: Array<{ date: string; count: number }>;
  dataKey?: string;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export const LineChartCard = ({
  title,
  data,
  dataKey = "count",
  color = "#4f46e5",
  gradientFrom = "#6366f1",
  gradientTo = "#818cf8"
}: Props) => (
  <Card title={title}>
    <div className="h-72 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientFrom} stopOpacity={0.4} />
              <stop offset="100%" stopColor={gradientTo} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
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
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            fill="url(#areaGradient)"
            dot={{ r: 4, stroke: "#ffffff", strokeWidth: 2, fill: color }}
            activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </Card>
);
