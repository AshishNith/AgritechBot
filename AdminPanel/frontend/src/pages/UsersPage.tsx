import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable, type Column } from "../components/ui/DataTable";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { SelectField } from "../components/ui/SelectField";
import { Button } from "../components/ui/Button";
import { Loader } from "../components/ui/Loader";
import { ErrorState } from "../components/ui/ErrorState";
import { Badge } from "../components/ui/Badge";
import type { UserListItem } from "../types/api";
import { formatDateTime } from "../utils/format";
import { useUserMutations, useUsers } from "../hooks/useUsers";

const MAX_LIMIT = 100000;

export const UsersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [crop, setCrop] = useState("");
  const [activity, setActivity] = useState<"" | "24h" | "7d" | "inactive" | "blocked">("");

  const usersQuery = useUsers({
    page: 1,
    limit: MAX_LIMIT,
    search: search || undefined,
    location: location || undefined,
    crop: crop || undefined,
    activity: activity || undefined
  });

  const { updateStatus, removeUser } = useUserMutations();

  const handleToggleStatus = async (user: UserListItem) => {
    try {
      await updateStatus.mutateAsync({
        userId: user.id,
        status: user.status === "blocked" ? "active" : "blocked"
      });
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDeleteUser = async (user: UserListItem) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete user "${
          user.name || "Unnamed User"
        }"? This will also cascade delete all their plans.`
      )
    ) {
      try {
        await removeUser.mutateAsync(user.id);
      } catch {
        alert("Failed to delete user");
      }
    }
  };

  const columns: Array<Column<UserListItem>> = useMemo(
    () => [
      {
        key: "name",
        header: "User",
        cell: (user) => (
          <div>
            <p className="font-semibold text-slate-900">{user.name || "Unnamed User"}</p>
            <p className="text-xs text-slate-500 font-mono font-medium">{user.phone}</p>
          </div>
        )
      },
      {
        key: "location",
        header: "Location",
        cell: (user) => user.location || "-"
      },
      {
        key: "crops",
        header: "Crops",
        cell: (user) => user.crops.join(", ") || "-"
      },
      {
        key: "plansGenerated",
        header: "Plans",
        cell: (user) => (
          <span className="font-bold text-slate-800 bg-slate-100 rounded px-2.5 py-0.5">
            {user.plansGenerated}
          </span>
        )
      },
      {
        key: "status",
        header: "Status",
        cell: (user) => (
          <Badge tone={user.status === "active" ? "green" : "red"}>{user.status.toUpperCase()}</Badge>
        )
      },
      {
        key: "lastActiveAt",
        header: "Last Activity",
        cell: (user) => formatDateTime(user.lastActiveAt)
      },
      {
        key: "actions",
        header: "Actions",
        cell: (user) => (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/users/${user.id}`)}>
              View Profile
            </Button>
            <Button
              variant={user.status === "blocked" ? "primary" : "danger"}
              size="sm"
              onClick={() => handleToggleStatus(user)}
              isLoading={updateStatus.isPending}
            >
              {user.status === "blocked" ? "Unblock" : "Block"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteUser(user)}
              isLoading={removeUser.isPending}
            >
              Delete
            </Button>
          </div>
        )
      }
    ],
    [navigate, updateStatus, removeUser]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-xs text-slate-500">
            Search, filter, and manage farmer lifecycles. Total registered accounts: {usersQuery.data?.items.length || 0}.
          </p>
        </div>
      </div>

      <Card title="User Search & Filters" description="Search and filter active/inactive accounts.">
        <div className="grid gap-4 md:grid-cols-4">
          <InputField label="Search" placeholder="Name / phone" value={search} onChange={(e) => setSearch(e.target.value)} />
          <InputField
            label="Location"
            placeholder="State / district"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <InputField label="Crop" placeholder="e.g. Wheat" value={crop} onChange={(e) => setCrop(e.target.value)} />
          <SelectField
            label="Activity Filter"
            value={activity}
            onChange={(e) => setActivity(e.target.value as typeof activity)}
            options={[
              { label: "All Statuses", value: "" },
              { label: "Last 24h Active", value: "24h" },
              { label: "Last 7 days Active", value: "7d" },
              { label: "Inactive Accounts", value: "inactive" },
              { label: "Blocked Accounts", value: "blocked" }
            ]}
          />
        </div>
      </Card>

      <Card>
        {(updateStatus.isError || removeUser.isError) && (
          <div className="mb-4">
            <ErrorState message="Failed to apply user status change. Please retry." />
          </div>
        )}
        {usersQuery.isLoading && <Loader />}
        {usersQuery.isError && <ErrorState message="Unable to load user accounts." />}
        {usersQuery.data && (
          <DataTable
            columns={columns}
            data={usersQuery.data.items}
            emptyTitle="No users found for current filters."
          />
        )}
      </Card>
    </div>
  );
};
