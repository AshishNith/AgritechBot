import { useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { Button } from "../components/ui/Button";
import { DataTable, type Column } from "../components/ui/DataTable";
import { Badge } from "../components/ui/Badge";
import { Loader } from "../components/ui/Loader";
import { ErrorState } from "../components/ui/ErrorState";
import { Pagination } from "../components/ui/Pagination";
import { Modal } from "../components/ui/Modal";
import type { PlanListItem } from "../types/api";
import { formatDateTime, toInputDate } from "../utils/format";
import { usePlanMutations, usePlans } from "../hooks/usePlans";

const PAGE_SIZE = 10;

const truncate = (value: string, max = 120): string => (value.length > max ? `${value.slice(0, max)}...` : value);

const toneByFeedback: Record<PlanListItem["feedback"], "green" | "red" | "slate"> = {
  good: "green",
  bad: "red",
  unrated: "slate"
};

interface ParsedPlanResponse {
  crop?: string;
  total_duration?: string;
  total_estimated_cost?: string;
  expected_yield?: string;
  profit_estimation?: string;
  risk_alerts?: string[];
  stages?: Array<{
    stage_name: string;
    duration: string;
    tasks?: Array<{
      task: string;
      details: string;
      tools_required?: string[];
      estimated_cost?: string;
      tips?: string;
    }>;
  }>;
  alternative_suggestions?: {
    low_budget?: string;
    high_budget?: string;
  };
}

const Icons = {
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  Dollar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="1" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Scale: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v17M12 3L5 9h14L12 3zM19 17c0 1.66-3.13 3-7 3s-7-1.34-7-3" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Alert: () => (
    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  ),
  Wrench: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  Lightbulb: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5.5 5.5 0 0 0 7 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6M10 22h4" />
    </svg>
  ),
  BudgetLow: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
};

export const PlansPage = () => {
  const [page, setPage] = useState(1);
  const [crop, setCrop] = useState("");
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanListItem | null>(null);
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");

  const parsedResponse = useMemo(() => {
    if (!selectedPlan?.response) return null;
    try {
      const data = JSON.parse(selectedPlan.response);
      if (data && (data.stages || data.crop || data.total_duration)) {
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }, [selectedPlan]);

  const plansQuery = usePlans({
    page,
    limit: PAGE_SIZE,
    crop: crop || undefined,
    userId: userId || undefined,
    from: from || undefined,
    to: to || undefined
  });
  const { feedback, regenerate } = usePlanMutations();

  const columns: Array<Column<PlanListItem>> = useMemo(
    () => [
      {
        key: "user",
        header: "User",
        cell: (plan) => (
          <div className="min-w-[150px]">
            <p className="font-medium text-slate-900">{plan.userName || "Unknown User"}</p>
            <p className="text-xs text-slate-500 font-mono">{plan.userId}</p>
            {plan.userPhone && <p className="text-xs text-slate-500">{plan.userPhone}</p>}
          </div>
        )
      },
      { key: "crop", header: "Crop", cell: (plan) => <span className="font-semibold">{plan.crop}</span> },
      { key: "prompt", header: "Prompt", cell: (plan) => <span className="text-slate-600 italic">"{truncate(plan.prompt, 80)}"</span> },
      {
        key: "feedback",
        header: "Feedback",
        cell: (plan) => <Badge tone={toneByFeedback[plan.feedback]}>{plan.feedback.toUpperCase()}</Badge>
      },
      {
        key: "tokenUsage",
        header: "Tokens",
        cell: (plan) => <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">{plan.tokenUsage}</span>
      },
      {
        key: "timestamp",
        header: "Date",
        cell: (plan) => <span className="text-xs text-slate-500 whitespace-nowrap">{formatDateTime(plan.createdAt)}</span>
      },
      {
        key: "actions",
        header: "Actions",
        cell: (plan) => (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedPlan(plan)}>
              View
            </Button>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              className="text-green-600 hover:bg-green-50"
              onClick={() => feedback.mutate({ planId: plan.id, feedback: "good" })}
              disabled={feedback.isPending && feedback.variables?.planId === plan.id}
            >
              Good
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => feedback.mutate({ planId: plan.id, feedback: "bad" })}
              disabled={feedback.isPending && feedback.variables?.planId === plan.id}
            >
              Bad
            </Button>
            <Button 
              size="sm" 
              onClick={() => regenerate.mutate(plan.id)} 
              isLoading={regenerate.isPending && regenerate.variables === plan.id}
            >
              Regen
            </Button>
          </div>
        )
      }
    ],
    [feedback, regenerate]
  );

  return (
    <div className="space-y-6">
      <Card title="AI Planner Monitoring" description="Review generated plans, feedback quality, and regenerate outputs.">
        <div className="grid gap-4 md:grid-cols-5">
          <InputField label="Filter by Crop" value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="e.g. Wheat" />
          <InputField label="Filter by User ID" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="ID..." />
          <InputField
            label="From Date"
            type="date"
            value={toInputDate(from)}
            onChange={(e) => setFrom(e.target.value ? new Date(e.target.value).toISOString() : "")}
          />
          <InputField
            label="To Date"
            type="date"
            value={toInputDate(to)}
            onChange={(e) => setTo(e.target.value ? new Date(e.target.value).toISOString() : "")}
          />
          <div className="flex items-end">
            <Button variant="primary" className="w-full" onClick={() => setPage(1)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        {(feedback.isError || regenerate.isError) && (
          <div className="mb-4">
            <ErrorState message="Plan action failed. Please retry." />
          </div>
        )}
        {plansQuery.isLoading && <div className="py-20"><Loader /></div>}
        {plansQuery.isError && <div className="py-10"><ErrorState message="Unable to fetch AI plans." /></div>}
        {plansQuery.data && (
          <>
            <DataTable columns={columns} data={plansQuery.data.items} emptyTitle="No plans found." />
            <div className="mt-4 border-t pt-4">
              <Pagination
                page={plansQuery.data.pagination.page}
                totalPages={plansQuery.data.pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Card>

      {selectedPlan && (() => {
        const planData = parsedResponse as ParsedPlanResponse | null;
        return (
          <Modal 
            isOpen={Boolean(selectedPlan)}
            title={`Plan Details - ${selectedPlan.crop}`} 
            onClose={() => {
              setSelectedPlan(null);
              setViewMode("formatted");
            }}
            size="xl"
          >
            <div className="space-y-6">
              {/* Tab Selector */}
              {planData ? (
                <div className="flex border-b border-slate-200">
                  <button
                    className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                      viewMode === "formatted"
                        ? "border-emerald-600 text-emerald-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                    onClick={() => setViewMode("formatted")}
                  >
                    🌱 Structured Plan Roadmap
                  </button>
                  <button
                    className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                      viewMode === "raw"
                        ? "border-emerald-600 text-emerald-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                    onClick={() => setViewMode("raw")}
                  >
                    💻 Raw JSON Response
                  </button>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-3 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>This advisory plan response could not be parsed into a structured layout and will be shown in raw text format.</span>
                </div>
              )}

              <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 app-scrollbar">
                {/* Input Prompt Section */}
                <section className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest font-mono">User Request / Seed Prompt</h4>
                  <p className="text-sm font-medium text-slate-800 italic leading-relaxed">
                    "{selectedPlan.prompt}"
                  </p>
                </section>

                {(!planData || viewMode === "raw") ? (
                  /* Raw Text View */
                  <section>
                    <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest font-mono">Raw Generated Output</h4>
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto max-h-96 shadow-inner">
                      <pre className="whitespace-pre-wrap">{selectedPlan.response}</pre>
                    </div>
                  </section>
                ) : (
                  /* Premium Formatted Plan View */
                  <div className="space-y-8 animate-fade-in">
                    {/* Header Metrics */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {/* Total Duration */}
                      <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
                          <Icons.Calendar />
                        </div>
                        <div>
                          <p className="text-3xs font-bold text-slate-400 uppercase tracking-widest">Total Duration</p>
                          <p className="text-base font-extrabold text-blue-900 mt-0.5">{planData.total_duration || "N/A"}</p>
                        </div>
                      </div>

                      {/* Total Estimated Cost */}
                      <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
                          <Icons.Dollar />
                        </div>
                        <div>
                          <p className="text-3xs font-bold text-slate-400 uppercase tracking-widest">Estimated Cost</p>
                          <p className="text-base font-extrabold text-emerald-900 mt-0.5">{planData.total_estimated_cost || "N/A"}</p>
                        </div>
                      </div>

                      {/* Expected Yield */}
                      <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600">
                          <Icons.Scale />
                        </div>
                        <div>
                          <p className="text-3xs font-bold text-slate-400 uppercase tracking-widest">Expected Yield</p>
                          <p className="text-base font-extrabold text-purple-900 mt-0.5">{planData.expected_yield || "N/A"}</p>
                        </div>
                      </div>

                      {/* Profit Estimation */}
                      <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600">
                          <Icons.TrendingUp />
                        </div>
                        <div>
                          <p className="text-3xs font-bold text-slate-400 uppercase tracking-widest">Profit Estimate</p>
                          <p className="text-base font-extrabold text-amber-900 mt-0.5">{planData.profit_estimation || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Risk Alerts */}
                    {planData.risk_alerts && planData.risk_alerts.length > 0 && (
                      <div className="bg-red-50 border border-red-200/60 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-red-800 font-bold text-sm mb-3">
                          <Icons.Alert />
                          <span>Critical Cultivation Risk Advisories</span>
                        </div>
                        <ul className="space-y-2">
                          {planData.risk_alerts.map((risk, idx) => (
                            <li key={idx} className="text-xs text-red-700 flex items-start gap-2 leading-relaxed">
                              <span className="text-red-500 select-none mt-0.5">•</span>
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Stages Timeline */}
                    {planData.stages && planData.stages.length > 0 && (
                      <div className="space-y-6">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Cultivation Stages & Tasks</h4>
                        <div className="relative pl-6 border-l border-slate-200 space-y-8 ml-2">
                          {planData.stages.map((stage, stageIdx) => (
                            <div key={stageIdx} className="relative">
                              {/* Timeline Bullet Node */}
                              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-sm ring-1 ring-emerald-600/30 flex items-center justify-center z-10" />
                              
                              <div className="space-y-4">
                                <div>
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xxs font-extrabold bg-emerald-50 border border-emerald-100 text-emerald-800 uppercase tracking-wider">
                                    Stage {stageIdx + 1}
                                  </span>
                                  <h5 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                                    {stage.stage_name}
                                    <span className="text-xs font-semibold text-slate-400 font-mono">({stage.duration})</span>
                                  </h5>
                                </div>

                                <div className="grid gap-4">
                                  {stage.tasks?.map((task, taskIdx) => (
                                    <div key={taskIdx} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-3xs hover:border-slate-300 transition-all space-y-3">
                                      <div className="flex items-start justify-between gap-4">
                                        <h6 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                          <Icons.ChevronRight />
                                          {task.task}
                                        </h6>
                                        {task.estimated_cost && (
                                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50">
                                            Cost: {task.estimated_cost}
                                          </span>
                                        )}
                                      </div>
                                      
                                      <p className="text-xs text-slate-600 leading-relaxed pl-6">
                                        {task.details}
                                      </p>

                                      {/* Tools Badges */}
                                      {task.tools_required && task.tools_required.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-2 pl-6 pt-1">
                                          <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-widest mr-1 flex items-center gap-1">
                                            <Icons.Wrench />
                                            Required Tools:
                                          </span>
                                          {task.tools_required.map((tool, toolIdx) => (
                                            <span key={toolIdx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-bold bg-slate-100 text-slate-600 border border-slate-200/60">
                                              {tool}
                                            </span>
                                          ))}
                                        </div>
                                      )}

                                      {/* Expert Tip */}
                                      {task.tips && (
                                        <div className="bg-amber-50/50 border border-amber-100/60 rounded-lg p-3 text-xs text-amber-800 leading-relaxed flex items-start gap-2.5 ml-6">
                                          <div className="text-amber-500 mt-0.5 flex-shrink-0">
                                            <Icons.Lightbulb />
                                          </div>
                                          <div>
                                            <strong className="font-bold text-amber-900 block mb-0.5">Agritech Advisory Tip:</strong>
                                            {task.tips}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Alternative Strategies */}
                    {planData.alternative_suggestions && (
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Alternative Farm Strategies</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          {planData.alternative_suggestions.low_budget && (
                            <div className="bg-gradient-to-br from-amber-50/30 to-white border border-amber-100/50 rounded-xl p-4 space-y-2">
                              <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Icons.BudgetLow />
                                Low Budget Approach
                              </h5>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {planData.alternative_suggestions.low_budget}
                              </p>
                            </div>
                          )}
                          {planData.alternative_suggestions.high_budget && (
                            <div className="bg-gradient-to-br from-emerald-50/30 to-white border border-emerald-100/50 rounded-xl p-4 space-y-2">
                              <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Icons.TrendingUp />
                                High Yield / Optimal Budget
                              </h5>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {planData.alternative_suggestions.high_budget}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Metadata Info */}
                <section className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-xs text-slate-400">
                  <div>
                    <p className="font-semibold uppercase tracking-wider text-4xs text-slate-400">Response Generated On</p>
                    <p className="font-medium text-slate-600 mt-1">{formatDateTime(selectedPlan.createdAt)}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wider text-4xs text-slate-400">LLM Inference Cost</p>
                    <p className="font-mono text-slate-600 mt-1">{selectedPlan.tokenUsage} API tokens consumed</p>
                  </div>
                </section>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => {
                setSelectedPlan(null);
                setViewMode("formatted");
              }}>
                Close Details
              </Button>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
};


