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

export const PlansPage = () => {
  const [page, setPage] = useState(1);
  const [crop, setCrop] = useState("");
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanListItem | null>(null);

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

      {selectedPlan && (
        <Modal 
          title={`Plan Details - ${selectedPlan.crop}`} 
          onClose={() => setSelectedPlan(null)}
          size="lg"
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <section>
              <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Input Prompt</h4>
              <div className="bg-slate-50 border rounded-lg p-4 font-mono text-xs text-slate-700 leading-relaxed">
                {selectedPlan.prompt}
              </div>
            </section>
            
            <section>
              <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">AI Generated Response</h4>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs text-green-400 leading-relaxed overflow-x-auto">
                <pre>{selectedPlan.response}</pre>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <p className="text-xs text-slate-500">Generated On</p>
                <p className="text-sm font-medium">{formatDateTime(selectedPlan.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Token Usage</p>
                <p className="text-sm font-medium">{selectedPlan.tokenUsage} tokens</p>
              </div>
            </section>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setSelectedPlan(null)}>Close</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};


