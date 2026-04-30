import { useMemo } from "react";
import { MetricCard } from "../components/dashboard/MetricCard";
import { LineChartCard } from "../components/charts/LineChartCard";
import { BarChartCard } from "../components/charts/BarChartCard";
import { Loader } from "../components/ui/Loader";
import { ErrorState } from "../components/ui/ErrorState";
import { Card } from "../components/ui/Card";
import { useDashboardOverview } from "../hooks/useDashboard";
import { formatNumber, formatPercent } from "../utils/format";

export const DashboardPage = () => {
  const overviewQuery = useDashboardOverview();

  const popularCrops = useMemo(
    () =>
      (overviewQuery.data?.metrics.popularCrops ?? []).map((crop) => ({
        crop: crop.crop,
        count: crop.count
      })),
    [overviewQuery.data]
  );

  if (overviewQuery.isLoading) return <Loader />;
  if (overviewQuery.isError || !overviewQuery.data) return <ErrorState message="Failed to load overview metrics." />;

  const { metrics, charts } = overviewQuery.data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total Users" value={formatNumber(metrics.totalUsers)} />
        <MetricCard label="Active Users (24h)" value={formatNumber(metrics.activeUsers24h)} />
        <MetricCard label="Active Users (7d)" value={formatNumber(metrics.activeUsers7d)} />
        <MetricCard label="AI Plans Generated" value={formatNumber(metrics.totalPlans)} />
        <MetricCard
          label="API Usage"
          value={formatNumber(metrics.apiUsage.requests)}
          subtitle={`${formatNumber(metrics.apiUsage.tokens)} tokens`}
        />
        <MetricCard label="Error Rate" value={formatPercent(metrics.errorRate)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <LineChartCard title="User Growth (Last 30 days)" data={charts.userGrowth} />
        <BarChartCard
          title="Crop Usage"
          data={charts.cropUsage.map((item) => ({ label: item.crop, value: item.count }))}
          color="#f59e0b"
        />
      </div>

      <Card title="Most Popular Crops">
        <div className="flex flex-wrap gap-2">
          {popularCrops.map((item) => (
            <span key={item.crop} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">
              {item.crop} ({item.count})
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
};

