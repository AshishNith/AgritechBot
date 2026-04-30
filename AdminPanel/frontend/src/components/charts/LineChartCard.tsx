import { ResponsiveContainer, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Line } from "recharts";
import { Card } from "../ui/Card";

interface Props {
  title: string;
  data: Array<{ date: string; count: number }>;
  dataKey?: string;
  color?: string;
}

export const LineChartCard = ({ title, data, dataKey = "count", color = "#059669" }: Props) => (
  <Card title={title}>
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

