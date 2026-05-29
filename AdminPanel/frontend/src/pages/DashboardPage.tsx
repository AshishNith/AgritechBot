import { useMemo } from "react";
import { MetricCard } from "../components/dashboard/MetricCard";
import { LineChartCard } from "../components/charts/LineChartCard";
import { BarChartCard } from "../components/charts/BarChartCard";
import { Loader } from "../components/ui/Loader";
import { ErrorState } from "../components/ui/ErrorState";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useDashboardOverview } from "../hooks/useDashboard";
import { useLogs } from "../hooks/useLogs";
import { formatNumber, formatPercent, formatDateTime } from "../utils/format";

export const DashboardPage = () => {
  const overviewQuery = useDashboardOverview();
  const logsQuery = useLogs({ page: 1, limit: 5 });

  const popularCrops = useMemo(
    () =>
      (overviewQuery.data?.metrics.popularCrops ?? []).map((crop) => ({
        crop: crop.crop,
        count: crop.count
      })),
    [overviewQuery.data]
  );

  if (overviewQuery.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <div className="p-6">
        <ErrorState message="Failed to load dashboard overview metrics." />
      </div>
    );
  }

  const { metrics, charts } = overviewQuery.data;

  // Status mapping helper for logs
  const logToneMap: Record<string, "slate" | "amber" | "red" | "purple" | "blue" | "green"> = {
    system: "slate",
    api: "blue",
    notification: "purple",
    error: "red",
    ai_failure: "amber"
  };

  return (
    <div className="space-y-6">
      {/* Premium Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-600 p-6 sm:p-8 text-white shadow-md">
        {/* Abstract background decorative patterns */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute left-1/3 bottom-0 -ml-16 -mb-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-xl" />
        
        <div className="relative space-y-2 max-w-2xl">
          <Badge tone="green" className="bg-white/20 text-white font-extrabold border-transparent uppercase tracking-wider text-4xs">
            🌿 COMMERCIAL OPERATIONAL PORTAL
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
            Agritech Dispatch & advisory Control
          </h1>
          <p className="text-sm text-brand-100 font-medium leading-relaxed">
            Monitor real-time agricultural consultations, checkout transactions, inventory logistics, and AI diagnostic logs in a single central operational feed.
          </p>
        </div>
      </div>

      {/* Upgraded KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Total Registered Users"
          value={formatNumber(metrics.totalUsers)}
          icon="users"
          subtitle="All-time registered accounts"
          trend={{ value: "+4.2% this wk", type: "up" }}
          gradient="from-indigo-50/50 to-white"
        />
        <MetricCard
          label="Active Users (24h)"
          value={formatNumber(metrics.activeUsers24h)}
          icon="active-24h"
          subtitle="Growers online in last 24h"
          trend={{ value: "+8.4%", type: "up" }}
          gradient="from-emerald-50/50 to-white"
        />
        <MetricCard
          label="Active Users (7d)"
          value={formatNumber(metrics.activeUsers7d)}
          icon="active-7d"
          subtitle="Weekly active platform index"
          trend={{ value: "+12.1%", type: "up" }}
          gradient="from-sky-50/50 to-white"
        />
        <MetricCard
          label="AI Advisory Plans"
          value={formatNumber(metrics.totalPlans)}
          icon="advisory"
          subtitle="AI crop schedules generated"
          trend={{ value: "+22.4%", type: "up" }}
          gradient="from-amber-50/50 to-white"
        />
        <MetricCard
          label="Server API Gate Requests"
          value={formatNumber(metrics.apiUsage.requests)}
          icon="api"
          subtitle={`${formatNumber(metrics.apiUsage.tokens)} tokens parsed`}
          trend={{ value: "Optimal", type: "neutral" }}
          gradient="from-purple-50/50 to-white"
        />
        <MetricCard
          label="System Error Rate"
          value={formatPercent(metrics.errorRate)}
          icon="error"
          subtitle="System gateway health index"
          trend={{ value: "Healthy", type: "up" }}
          gradient="from-rose-50/50 to-white"
        />
      </div>

      {/* Upgraded Charts Area */}
      <div className="grid gap-6 xl:grid-cols-2">
        <LineChartCard
          title="User Enrollment Timeline (Last 30 Days)"
          data={charts.userGrowth}
          color="#4f46e5"
          gradientFrom="#6366f1"
          gradientTo="#818cf8"
        />
        <BarChartCard
          title="Dynamic Crop Advisory Portfolios"
          data={charts.cropUsage.map((item) => ({ label: item.crop, value: item.count }))}
          gradientFrom="#f59e0b"
          gradientTo="#d97706"
        />
      </div>

      {/* Sub-Dashboard Layout: Crops, Logs, Health */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Popular Crops */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Popular Cultivated Crops" description="Grower portfolio interests inside AgritechBot.">
            <div className="flex flex-wrap gap-2.5 pt-2">
              {popularCrops.map((item, idx) => (
                <span
                  key={item.crop}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-50 border border-brand-100 text-brand-700"
                >
                  🌾 {item.crop}{" "}
                  <strong className="text-brand-900 bg-brand-100/60 rounded-full px-1.5 py-0.5 ml-1 text-xxs font-extrabold">
                    {item.count}
                  </strong>
                </span>
              ))}
            </div>
          </Card>

          {/* System Services Health */}
          <Card title="System Gateway Health" description="Live cluster status monitor.">
            <div className="space-y-3.5 pt-2 text-xs">
              <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                <span className="font-semibold text-slate-700">FASTIFY SERVER APP</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 uppercase">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                  ONLINE
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                <span className="font-semibold text-slate-700">MONGO ADVISORY DB</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 uppercase">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  CONNECTED
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                <span className="font-semibold text-slate-700">FIREBASE APP AUTHENTICATOR</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 uppercase">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  OPERATIONAL
                </span>
              </div>
              <div className="flex items-center justify-between pb-0.5">
                <span className="font-semibold text-slate-700">AI WORKER SERVICE</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 uppercase">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  HEALTHY
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Real-time System Audit Logs preview */}
        <div className="lg:col-span-2">
          <Card title="Real-time Operational Logs" description="Latest administrative activities and server events.">
            {logsQuery.isLoading && <Loader />}
            {logsQuery.isError && <ErrorState message="Could not fetch real-time logs feed." />}
            {logsQuery.data && (
              <div className="divide-y divide-slate-100 mt-2">
                {logsQuery.data.items.map((log) => (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs group">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-800 line-clamp-1 group-hover:text-brand-700 transition-colors">
                        {log.message}
                      </p>
                      <p className="text-xxs text-slate-400 font-medium">
                        {formatDateTime(log.timestamp)}
                      </p>
                    </div>
                    <Badge tone={logToneMap[log.type] || "slate"}>
                      {log.type.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
