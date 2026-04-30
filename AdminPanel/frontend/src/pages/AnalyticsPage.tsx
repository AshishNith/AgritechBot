import { LineChartCard } from "../components/charts/LineChartCard";
import { BarChartCard } from "../components/charts/BarChartCard";
import { Card } from "../components/ui/Card";
import { Loader } from "../components/ui/Loader";
import { ErrorState } from "../components/ui/ErrorState";
import { useAnalytics } from "../hooks/useAnalytics";
import { formatNumber, formatPercent } from "../utils/format";

export const AnalyticsPage = () => {
  const analyticsQuery = useAnalytics();

  if (analyticsQuery.isLoading) return <Loader />;
  if (analyticsQuery.isError || !analyticsQuery.data) return <ErrorState message="Unable to load analytics data." />;

  const { dailyActiveUsers, planGenerationTrends, tokenUsagePerDay, funnel } = analyticsQuery.data;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <LineChartCard title="Daily Active Users" data={dailyActiveUsers} color="#0284c7" />
        <LineChartCard title="Plan Generation Trends" data={planGenerationTrends} color="#f97316" />
      </div>

      <BarChartCard
        title="Token Usage Per Day"
        data={tokenUsagePerDay.map((item) => ({ label: item.date, value: item.count }))}
        color="#8b5cf6"
      />

      <Card title="Conversion Funnel" description="Signup → Crop Selection → Plan Generation">
        <div className="grid gap-3 md:grid-cols-3">
          {funnel.map((stage) => (
            <div key={stage.stage} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{stage.stage}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{formatNumber(stage.count)}</p>
              <p className="text-sm text-slate-600">{formatPercent(stage.conversionRate)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

