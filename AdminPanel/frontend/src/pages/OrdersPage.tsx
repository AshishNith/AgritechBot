import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { SelectField } from "../components/ui/SelectField";
import { DataTable, type Column } from "../components/ui/DataTable";
import { Loader } from "../components/ui/Loader";
import { ErrorState } from "../components/ui/ErrorState";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useOrderMutations, useOrders } from "../hooks/useOrders";
import type { OrderItem } from "../types/api";
import { formatDateTime, formatNumber } from "../utils/format";

const MAX_LIMIT = 100000;

const toneMap: Record<OrderItem["status"], "amber" | "blue" | "purple" | "green" | "red"> = {
  pending: "amber",
  confirmed: "blue",
  shipped: "purple",
  delivered: "green",
  cancelled: "red"
};

export const OrdersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderItem["status"] | "all">("all");

  const ordersQuery = useOrders({
    page: 1,
    limit: MAX_LIMIT,
    status: status !== "all" ? status : undefined,
    search: search || undefined
  });

  const { updateStatus } = useOrderMutations();

  const handleStatusChange = async (orderId: string, nextStatus: OrderItem["status"]) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: nextStatus });
    } catch {
      alert("Failed to update order status.");
    }
  };

  const columns: Array<Column<OrderItem>> = useMemo(
    () => [
      {
        key: "orderId",
        header: "Order Details",
        cell: (order) => (
          <div>
            <p className="font-mono text-xs text-brand-700 font-bold">#{order.id.slice(-8).toUpperCase()}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{formatDateTime(order.createdAt)}</p>
          </div>
        )
      },
      {
        key: "customer",
        header: "Customer",
        cell: (order) => (
          <div>
            <p className="font-semibold text-slate-900">{order.userName || "Unnamed Farmer"}</p>
            <p className="text-xs text-slate-500 font-mono font-medium">{order.userPhone}</p>
          </div>
        )
      },
      {
        key: "cart",
        header: "Products Purchased",
        cell: (order) => {
          const items = order.items || [];
          const labels = items.map((i) => `${i.name} (x${i.quantity})`);
          const text = labels.join(", ");
          return (
            <div className="max-w-xs overflow-hidden">
              <p className="text-sm text-slate-800 font-medium truncate">{text || "-"}</p>
              <p className="text-xs text-slate-400 mt-0.5">{items.length} unique items</p>
            </div>
          );
        }
      },
      {
        key: "total",
        header: "Total Amount",
        cell: (order) => <p className="font-bold text-slate-950">₹{formatNumber(order.totalAmount)}</p>
      },
      {
        key: "status",
        header: "Fulfillment Status",
        cell: (order) => (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Badge tone={toneMap[order.status]}>{order.status.toUpperCase()}</Badge>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
              className="text-xs border rounded px-1.5 py-0.5 bg-slate-50 border-slate-200 text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )
      },
      {
        key: "actions",
        header: "Details",
        cell: (order) => (
          <Button variant="secondary" size="sm" onClick={() => navigate(`/orders/${order.id}`)}>
            Inspect
          </Button>
        )
      }
    ],
    [navigate]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
          <p className="text-xs text-slate-500">
            Verify checkout receipts, track shipping destinations, and update delivery status. Total orders: {ordersQuery.data?.items.length || 0}.
          </p>
        </div>
      </div>

      <Card title="Filter & Search Orders" description="Locate and track specific checkouts.">
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Search Order"
            placeholder="Name, Phone, ID, City..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <SelectField
            label="Fulfillment Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { label: "All Statuses", value: "all" },
              { label: "Pending Verification", value: "pending" },
              { label: "Confirmed Purchases", value: "confirmed" },
              { label: "Shipped Out / En Route", value: "shipped" },
              { label: "Delivered Packages", value: "delivered" },
              { label: "Cancelled Orders", value: "cancelled" }
            ]}
          />
        </div>
      </Card>

      <Card>
        {ordersQuery.isLoading && <Loader />}
        {ordersQuery.isError && <ErrorState message="Unable to fetch marketplace orders." />}
        {ordersQuery.data && (
          <DataTable
            columns={columns}
            data={ordersQuery.data.items}
            emptyTitle="No orders placed yet."
          />
        )}
      </Card>
    </div>
  );
};
