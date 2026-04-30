import { useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { Button } from "../components/ui/Button";
import { DataTable, type Column } from "../components/ui/DataTable";
import { Badge } from "../components/ui/Badge";
import { Loader } from "../components/ui/Loader";
import { ErrorState } from "../components/ui/ErrorState";
import { Pagination } from "../components/ui/Pagination";
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
          <div>
            <p className="font-medium text-slate-900">{plan.userName || "Unknown User"}</p>
            <p className="text-xs text-slate-500">{plan.userId}</p>
            {plan.userPhone && <p className="text-xs text-slate-500">{plan.userPhone}</p>}
          </div>
        )
      },
      { key: "crop", header: "Crop", cell: (plan) => plan.crop },
      { key: "prompt", header: "Prompt", cell: (plan) => truncate(plan.prompt, 140) },
      { key: "response", header: "AI Response", cell: (plan) => truncate(plan.response, 200) },
      {
        key: "feedback",
        header: "Feedback",
        cell: (plan) => <Badge tone={toneByFeedback[plan.feedback]}>{plan.feedback.toUpperCase()}</Badge>
      },
      {
        key: "timestamp",
        header: "Timestamp",
        cell: (plan) => formatDateTime(plan.createdAt)
      },
      {
        key: "actions",
        header: "Actions",
        cell: (plan) => (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => feedback.mutate({ planId: plan.id, feedback: "good" })}
              isLoading={feedback.isPending}
            >
              Mark Good
            </Button>
            <Button
              variant="danger"
              onClick={() => feedback.mutate({ planId: plan.id, feedback: "bad" })}
              isLoading={feedback.isPending}
            >
              Mark Bad
            </Button>
            <Button onClick={() => regenerate.mutate(plan.id)} isLoading={regenerate.isPending}>
              Regenerate
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
        <div className="grid gap-3 md:grid-cols-5">
          <InputField label="Filter by Crop" value={crop} onChange={(e) => setCrop(e.target.value)} />
          <InputField label="Filter by User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
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
            <Button variant="secondary" onClick={() => setPage(1)}>
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
        {plansQuery.isLoading && <Loader />}
        {plansQuery.isError && <ErrorState message="Unable to fetch AI plans." />}
        {plansQuery.data && (
          <>
            <DataTable columns={columns} data={plansQuery.data.items} emptyTitle="No plans found." />
            <Pagination
              page={plansQuery.data.pagination.page}
              totalPages={plansQuery.data.pagination.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
};

