import { useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { SelectField } from "../components/ui/SelectField";
import { DataTable, type Column } from "../components/ui/DataTable";
import { Badge } from "../components/ui/Badge";
import { Loader } from "../components/ui/Loader";
import { ErrorState } from "../components/ui/ErrorState";
import { Pagination } from "../components/ui/Pagination";
import { useLogs } from "../hooks/useLogs";
import type { LogItem } from "../types/api";
import { formatDateTime } from "../utils/format";

const PAGE_SIZE = 20;

const toneMap: Record<LogItem["type"], "slate" | "red" | "amber" | "blue" | "green"> = {
  api: "blue",
  error: "red",
  ai_failure: "amber",
  notification: "green",
  system: "slate"
};

export const LogsPage = () => {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<"" | "api" | "error" | "ai_failure" | "notification" | "system">("");

  const logsQuery = useLogs({ page, limit: PAGE_SIZE, type: type || undefined });

  const columns: Array<Column<LogItem>> = useMemo(
    () => [
      {
        key: "type",
        header: "Type",
        cell: (log) => <Badge tone={toneMap[log.type]}>{log.type.toUpperCase()}</Badge>
      },
      {
        key: "message",
        header: "Message",
        cell: (log) => log.message
      },
      {
        key: "timestamp",
        header: "Timestamp",
        cell: (log) => formatDateTime(log.timestamp)
      },
      {
        key: "meta",
        header: "Meta",
        cell: (log) => (
          <pre className="max-w-[420px] whitespace-pre-wrap break-all text-xs text-slate-500">
            {log.meta ? JSON.stringify(log.meta) : "-"}
          </pre>
        )
      }
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Card title="System Logs" description="API logs, error logs, AI failure logs, and notification logs.">
        <div className="max-w-xs">
          <SelectField
            label="Log Type"
            value={type}
            onChange={(event) => {
              setType(event.target.value as typeof type);
              setPage(1);
            }}
            options={[
              { label: "All", value: "" },
              { label: "API", value: "api" },
              { label: "Error", value: "error" },
              { label: "AI Failure", value: "ai_failure" },
              { label: "Notification", value: "notification" },
              { label: "System", value: "system" }
            ]}
          />
        </div>
      </Card>

      <Card>
        {logsQuery.isLoading && <Loader />}
        {logsQuery.isError && <ErrorState message="Failed to load logs." />}
        {logsQuery.data && (
          <>
            <DataTable columns={columns} data={logsQuery.data.items} emptyTitle="No logs available." />
            <Pagination
              page={logsQuery.data.pagination.page}
              totalPages={logsQuery.data.pagination.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
};

