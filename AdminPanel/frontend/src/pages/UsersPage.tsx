import { useMemo, useState } from "react";
import { DataTable, type Column } from "../components/ui/DataTable";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { SelectField } from "../components/ui/SelectField";
import { Button } from "../components/ui/Button";
import { Loader } from "../components/ui/Loader";
import { ErrorState } from "../components/ui/ErrorState";
import { Pagination } from "../components/ui/Pagination";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import type { UserListItem } from "../types/api";
import { formatDateTime } from "../utils/format";
import { useUserDetail, useUserMutations, useUsers } from "../hooks/useUsers";

const PAGE_SIZE = 10;

export const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [crop, setCrop] = useState("");
  const [activity, setActivity] = useState<"" | "24h" | "7d" | "inactive" | "blocked">("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const usersQuery = useUsers({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    location: location || undefined,
    crop: crop || undefined,
    activity: activity || undefined
  });

  const selectedUserQuery = useUserDetail(selectedUserId, Boolean(selectedUserId));
  const { updateStatus, removeUser } = useUserMutations();

  const columns: Array<Column<UserListItem>> = useMemo(
    () => [
      {
        key: "name",
        header: "User",
        cell: (user) => (
          <div>
            <p className="font-medium text-slate-900">{user.name || "Unnamed User"}</p>
            <p className="text-xs text-slate-500">{user.phone}</p>
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
        cell: (user) => user.plansGenerated
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
            <Button variant="secondary" onClick={() => setSelectedUserId(user.id)}>
              View
            </Button>
            <Button
              variant={user.status === "blocked" ? "primary" : "danger"}
              onClick={() =>
                updateStatus.mutate({
                  userId: user.id,
                  status: user.status === "blocked" ? "active" : "blocked"
                })
              }
              isLoading={updateStatus.isPending}
            >
              {user.status === "blocked" ? "Unblock" : "Block"}
            </Button>
            <Button variant="ghost" onClick={() => removeUser.mutate(user.id)} isLoading={removeUser.isPending}>
              Delete
            </Button>
          </div>
        )
      }
    ],
    [removeUser, updateStatus]
  );

  return (
    <div className="space-y-6">
      <Card title="User Management" description="Search, filter, and manage user lifecycle from one place.">
        <div className="grid gap-3 md:grid-cols-4">
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
              { label: "All", value: "" },
              { label: "Last 24h", value: "24h" },
              { label: "Last 7 days", value: "7d" },
              { label: "Inactive", value: "inactive" },
              { label: "Blocked", value: "blocked" }
            ]}
          />
        </div>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => setPage(1)}>
            Apply Filters
          </Button>
        </div>
      </Card>

      <Card>
        {(updateStatus.isError || removeUser.isError) && (
          <div className="mb-4">
            <ErrorState message="Failed to apply user action. Please retry." />
          </div>
        )}
        {usersQuery.isLoading && <Loader />}
        {usersQuery.isError && <ErrorState message="Unable to load users." />}
        {usersQuery.data && (
          <>
            <DataTable columns={columns} data={usersQuery.data.items} emptyTitle="No users found for current filters." />
            <Pagination
              page={usersQuery.data.pagination.page}
              totalPages={usersQuery.data.pagination.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      <Modal
        isOpen={Boolean(selectedUserId)}
        title="User Profile"
        onClose={() => setSelectedUserId("")}
        footer={<Button onClick={() => setSelectedUserId("")}>Done</Button>}
      >
        {selectedUserQuery.isLoading && <Loader />}
        {selectedUserQuery.isError && <ErrorState message="Unable to load profile." />}
        {selectedUserQuery.data && (
          <div className="grid gap-3 text-sm">
            <div>
              <p className="font-medium text-slate-700">Name</p>
              <p>{selectedUserQuery.data.user.name || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-700">Phone</p>
              <p>{selectedUserQuery.data.user.phone}</p>
            </div>
            <div>
              <p className="font-medium text-slate-700">Location</p>
              <p>{selectedUserQuery.data.user.location || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-700">Selected Crops</p>
              <p>{selectedUserQuery.data.user.crops.join(", ") || "-"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-700">AI Plans Generated</p>
              <p>{selectedUserQuery.data.user.plansGenerated}</p>
            </div>
            <div>
              <p className="font-medium text-slate-700">Status</p>
              <Badge tone={selectedUserQuery.data.user.status === "active" ? "green" : "red"}>
                {selectedUserQuery.data.user.status}
              </Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

