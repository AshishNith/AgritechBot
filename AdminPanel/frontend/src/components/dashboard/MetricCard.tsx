import { Card } from "../ui/Card";

interface Props {
  label: string;
  value: string;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: string;
    type: "up" | "down" | "neutral";
  };
  gradient?: string;
}

export const MetricCard = ({ label, value, subtitle, icon, trend, gradient = "from-brand-50/50 to-white" }: Props) => {
  const getIconSvg = () => {
    switch (icon) {
      case "users":
        return (
          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case "active-24h":
        return (
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "active-7d":
        return (
          <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "advisory":
        return (
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "api":
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case "error":
        return (
          <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={`relative border border-slate-200/80 rounded-2xl p-5 bg-gradient-to-br ${gradient} shadow-sm hover:shadow-md hover:scale-[1.01] hover:border-slate-300 transition-all duration-300 overflow-hidden group`}>
      {/* Decorative background glow element */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-slate-400/5 rounded-full group-hover:scale-125 transition-transform duration-500" />
      
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xxs font-extrabold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="text-3xl font-black text-slate-900 leading-none tracking-tight">{value}</p>
        </div>
        
        {icon && (
          <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm transition-transform group-hover:rotate-6">
            {getIconSvg()}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {subtitle ? (
          <span className="text-xs font-semibold text-slate-500">{subtitle}</span>
        ) : (
          <span className="text-xs font-semibold text-slate-400">Total volume</span>
        )}

        {trend && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xxs font-extrabold uppercase ${
              trend.type === "up"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : trend.type === "down"
                ? "bg-rose-50 text-rose-700 border border-rose-100"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {trend.type === "up" ? "↑" : trend.type === "down" ? "↓" : "•"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
