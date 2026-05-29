import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Loader } from "../components/ui/Loader";
import { ErrorState } from "../components/ui/ErrorState";
import { Badge } from "../components/ui/Badge";
import { useOrderDetail, useOrderMutations } from "../hooks/useOrders";
import type { OrderItem } from "../types/api";
import { formatDateTime, formatNumber } from "../utils/format";

const toneMap: Record<OrderItem["status"], "amber" | "blue" | "purple" | "green" | "red"> = {
  pending: "amber",
  confirmed: "blue",
  shipped: "purple",
  delivered: "green",
  cancelled: "red"
};

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useOrderDetail(id || "");
  const { updateStatus } = useOrderMutations();

  const orderDetails = data?.order;

  const handleStatusChange = async (nextStatus: OrderItem["status"]) => {
    if (!orderDetails) return;
    try {
      await updateStatus.mutateAsync({ orderId: orderDetails.id, status: nextStatus });
      refetch();
    } catch {
      alert("Failed to update order status.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError || !orderDetails) {
    return (
      <div className="p-6">
        <ErrorState message="Could not fetch order receipt details. Please return to list." />
        <Button className="mt-4" onClick={() => navigate("/orders")}>
          Back to Orders
        </Button>
      </div>
    );
  }

  // Stepper helper
  const statusSteps: OrderItem["status"][] = ["pending", "confirmed", "shipped", "delivered"];
  const currentStepIndex = statusSteps.indexOf(orderDetails.status);

  return (
    <div className="space-y-6">
      {/* Header and Back Action */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold mb-1"
          >
            ← Back to Orders List
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            Order Receipt: #{orderDetails.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-xs text-slate-500">
            Ordered on {formatDateTime(orderDetails.createdAt)} • Reference: {orderDetails.paymentId || "Dev-Manual"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/orders")}>
            Back to List
          </Button>
        </div>
      </div>

      {/* Shipment Tracker Stepper */}
      {orderDetails.status !== "cancelled" && (
        <Card title="Fulfillment Pipeline" description="Visual tracker showing shipment en-route progress.">
          <div className="relative flex items-center justify-between py-6 max-w-3xl mx-auto">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0 rounded" />
            
            {/* Active Progress Line */}
            <div
              className="absolute top-1/2 left-0 h-1 bg-brand-500 -translate-y-1/2 z-0 rounded transition-all duration-500"
              style={{
                width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`
              }}
            />

            {statusSteps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isActive = idx === currentStepIndex;
              return (
                <div key={step} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? "bg-brand-600 text-white ring-4 ring-brand-100"
                        : isCompleted
                        ? "bg-brand-500 text-white"
                        : "bg-slate-200 text-slate-500 border border-slate-300"
                    }`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`text-xxs font-bold uppercase tracking-wider mt-2 transition-all ${
                      isActive ? "text-brand-600 font-extrabold" : isCompleted ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {orderDetails.status === "cancelled" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800 text-sm">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-bold">Order Cancelled</p>
            <p className="text-xs text-red-700">This order was cancelled by the farmer or catalog admin. Inventory has been returned to stock.</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Columns: Customer details & Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card title="Buyer Information" description="Contact info for this purchaser.">
              <div className="space-y-3 text-sm pt-2">
                <div>
                  <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Farmer Name</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{orderDetails.userName || "Unnamed Farmer"}</p>
                </div>
                <div>
                  <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                  <p className="font-mono font-medium text-slate-800 mt-0.5">{orderDetails.userPhone}</p>
                </div>
                {orderDetails.userEmail && (
                  <div>
                    <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-slate-800 mt-0.5">{orderDetails.userEmail}</p>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Shipping Destination" description="Where the package is en-route.">
              <div className="text-sm leading-relaxed text-slate-700 pt-2 space-y-1.5">
                <p className="font-semibold text-slate-800">{orderDetails.deliveryAddress.line1}</p>
                {orderDetails.deliveryAddress.line2 && <p>{orderDetails.deliveryAddress.line2}</p>}
                <p>
                  {orderDetails.deliveryAddress.city}, {orderDetails.deliveryAddress.state}
                </p>
                <div className="pt-1.5 border-t">
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Postal Pincode</span>
                  <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 border border-brand-100 rounded px-2.5 py-1">
                    {orderDetails.deliveryAddress.pincode}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <Card title="Cart Items Purchased" description="Listing of products and quantities checkout.">
            <div className="overflow-x-auto rounded-lg border border-slate-200 mt-2">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 text-left uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-center">Quantity</th>
                    <th className="px-4 py-3 text-right font-bold">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(orderDetails.items || []).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                      <td className="px-4 py-3 text-right text-slate-500">₹{formatNumber(item.price)}</td>
                      <td className="px-4 py-3 text-center text-slate-800 font-bold">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-950">₹{formatNumber(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Status & Financial Summary */}
        <div className="space-y-6">
          <Card title="Fulfillment Status" description="Advance order stage en-route.">
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase font-semibold">Current State</span>
                <Badge tone={toneMap[orderDetails.status]}>{orderDetails.status.toUpperCase()}</Badge>
              </div>

              <div className="space-y-1.5 border-t pt-3">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-wide">Change Fulfillment Stage</label>
                <select
                  value={orderDetails.status}
                  onChange={(e) => handleStatusChange(e.target.value as any)}
                  className="w-full text-xs border rounded-lg px-2.5 py-2 bg-white border-slate-300 text-slate-700 focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="pending">Pending Verification</option>
                  <option value="confirmed">Confirmed Purchases</option>
                  <option value="shipped">Shipped Out / En Route</option>
                  <option value="delivered">Delivered Packages</option>
                  <option value="cancelled">Cancelled Orders</option>
                </select>
                <p className="text-xxs text-slate-400 italic leading-normal pt-1.5">
                  Updating this stage notifies the grower in their mobile app feed immediately.
                </p>
              </div>
            </div>
          </Card>

          <Card title="Receipt Ledger" description="Cost Breakdown.">
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span>₹{formatNumber(orderDetails.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fulfillment & Shipping</span>
                <span className="text-green-600 font-semibold font-mono">FREE</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform CGST + SGST (0%)</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between border-t pt-3 text-sm font-black text-slate-950">
                <span>Grand Total</span>
                <span>₹{formatNumber(orderDetails.totalAmount)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
