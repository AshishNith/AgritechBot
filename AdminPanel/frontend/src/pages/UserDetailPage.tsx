import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Loader } from "../components/ui/Loader";
import { ErrorState } from "../components/ui/ErrorState";
import { Badge } from "../components/ui/Badge";
import { InputField } from "../components/ui/InputField";
import { SelectField } from "../components/ui/SelectField";
import { useUserDetail, useUserMutations } from "../hooks/useUsers";
import { formatDateTime } from "../utils/format";

const PLAN_DEFAULTS = {
  free: { chatCredits: 10, imageCredits: 1 },
  basic: { chatCredits: 50, imageCredits: 3 },
  pro: { chatCredits: 100, imageCredits: 10 }
} as const;

export const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const userQuery = useUserDetail(id || "");
  const { updateStatus, removeUser, updateWallet } = useUserMutations();

  const user = userQuery.data?.user;
  const wallet = userQuery.data?.wallet;

  const [plan, setPlan] = useState<"free" | "basic" | "pro">("free");
  const [chatCredits, setChatCredits] = useState(0);
  const [imageCredits, setImageCredits] = useState(0);
  const [topupCredits, setTopupCredits] = useState(0);
  const [topupImageCredits, setTopupImageCredits] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  const handlePlanChange = (selectedPlan: "free" | "basic" | "pro") => {
    setPlan(selectedPlan);
    setChatCredits(PLAN_DEFAULTS[selectedPlan].chatCredits);
    setImageCredits(PLAN_DEFAULTS[selectedPlan].imageCredits);
  };

  useEffect(() => {
    if (wallet) {
      setPlan(wallet.plan);
      setChatCredits(wallet.chatCredits);
      setImageCredits(wallet.imageCredits);
      setTopupCredits(wallet.topupCredits || 0);
      setTopupImageCredits(wallet.topupImageCredits || 0);
    }
  }, [wallet]);

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      await updateStatus.mutateAsync({
        userId: user.id,
        status: user.status === "blocked" ? "active" : "blocked"
      });
      userQuery.refetch();
    } catch {
      alert("Failed to update status");
    }
  };

  const handleUpdateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSuccessMsg("");
      await updateWallet.mutateAsync({
        userId: user.id,
        payload: { plan, chatCredits, imageCredits, topupCredits, topupImageCredits }
      });
      setSuccessMsg("Plan and credits updated successfully!");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch {
      alert("Failed to update user plan and credits.");
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    if (
      window.confirm(
        `Are you sure you want to permanently delete user "${user.name || "Unnamed Farmer"}"? This will cascade-delete all plans and files associated with them. This action is irreversible.`
      )
    ) {
      try {
        await removeUser.mutateAsync(user.id);
        navigate("/users");
      } catch {
        alert("Failed to delete user");
      }
    }
  };

  if (userQuery.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (userQuery.isError || !user) {
    return (
      <div className="p-6">
        <ErrorState message="Could not fetch farmer profile details. Please return to list." />
        <Button className="mt-4" onClick={() => navigate("/users")}>
          Back to Farmers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Back Action */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <button
            onClick={() => navigate("/users")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold mb-1"
          >
            ← Back to Users List
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            Farmer Profile: {user.name || "Unnamed Farmer"}
          </h1>
          <p className="text-xs text-slate-500">
            Registered phone: {user.phone} • Member since {formatDateTime(user.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={user.status === "blocked" ? "primary" : "danger"}
            onClick={handleToggleStatus}
            isLoading={updateStatus.isPending}
          >
            {user.status === "blocked" ? "Unblock User" : "Block User"}
          </Button>
          <Button variant="ghost" onClick={handleDeleteUser} isLoading={removeUser.isPending}>
            Delete User Account
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: General Profile & Wallet Editor */}
        <div className="md:col-span-2 space-y-6">
          <Card title="Account Overview" description="Detailed account information for this grower.">
            <div className="grid gap-6 sm:grid-cols-2 text-sm pt-2">
              <div className="space-y-1">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-xxs">Farmer Name</p>
                <p className="text-base font-bold text-slate-900">{user.name || "—"}</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-xxs">Phone Number</p>
                <p className="text-base font-bold text-slate-900 font-mono">{user.phone}</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-xxs">State / Region</p>
                <p className="text-base font-bold text-slate-900">{user.state || user.location || "—"}</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-xxs">District / Village</p>
                <p className="text-base font-bold text-slate-900">{user.district || "—"}</p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-xxs">Lifecycle Status</p>
                <div>
                  <Badge tone={user.status === "active" ? "green" : "red"}>
                    {user.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-xxs">Last App Access</p>
                <p className="text-base font-medium text-slate-900">{formatDateTime(user.lastActiveAt)}</p>
              </div>
            </div>
          </Card>

          {/* New Wallet, Subscription Plan & API Credits Editor */}
          <Card title="Subscription Plan & API Credits" description="Manage active plan tier and chat/scan wallet balances directly.">
            <form onSubmit={handleUpdateWallet} className="space-y-6 pt-2">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Plan select */}
                <div>
                  <SelectField
                    label="Subscription Plan"
                    value={plan}
                    onChange={(e) => handlePlanChange(e.target.value as any)}
                    options={[
                      { label: "Free Tier", value: "free" },
                      { label: "Basic Plan", value: "basic" },
                      { label: "Pro Plan", value: "pro" }
                    ]}
                  />
                </div>

                {/* Chat credits editing block */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 space-y-3 shadow-sm">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5 border-b pb-1.5 border-slate-200/60">
                    💬 Chat Credits
                  </h4>
                  <InputField
                    label="Base Credits (Plan)"
                    type="number"
                    value={chatCredits}
                    onChange={(e) => setChatCredits(Number(e.target.value))}
                  />
                  <InputField
                    label="Topup Credits"
                    type="number"
                    value={topupCredits}
                    onChange={(e) => setTopupCredits(Number(e.target.value))}
                  />
                  <div className="text-xxs text-slate-500 font-bold pt-2 border-t border-slate-200/60 flex justify-between">
                    <span>Combined Total Available:</span>
                    <span className="text-brand-600 font-extrabold">{chatCredits + topupCredits}</span>
                  </div>
                </div>

                {/* Scan/Image credits editing block */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 space-y-3 shadow-sm">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5 border-b pb-1.5 border-slate-200/60">
                    📷 Scan Credits
                  </h4>
                  <InputField
                    label="Base Credits (Plan)"
                    type="number"
                    value={imageCredits}
                    onChange={(e) => setImageCredits(Number(e.target.value))}
                  />
                  <InputField
                    label="Topup Credits"
                    type="number"
                    value={topupImageCredits}
                    onChange={(e) => setTopupImageCredits(Number(e.target.value))}
                  />
                  <div className="text-xxs text-slate-500 font-bold pt-2 border-t border-slate-200/60 flex justify-between">
                    <span>Combined Total Available:</span>
                    <span className="text-brand-600 font-extrabold">{imageCredits + topupImageCredits}</span>
                  </div>
                </div>
              </div>

              {wallet && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 flex justify-between items-center text-xs text-slate-600">
                  <span className="font-semibold text-slate-500">Platform Usage Logs:</span>
                  <div className="flex gap-6 font-medium">
                    <span>💬 Total Chats Sent: <strong className="text-slate-800 font-bold">{wallet.totalChatsUsed}</strong></span>
                    <span>📷 Total Scans Taken: <strong className="text-slate-800 font-bold">{wallet.totalScansUsed}</strong></span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Button type="submit" isLoading={updateWallet.isPending}>
                  Update Plan & Credits
                </Button>

                {successMsg && (
                  <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg animate-pulse">
                    ✓ {successMsg}
                  </span>
                )}
              </div>
            </form>
          </Card>

          {/* Crops Interest Section */}
          <Card title="Cultivated Crops & Interests" description="Crops being monitored or consulted using AgritechBot.">
            {user.crops && user.crops.length > 0 ? (
              <div className="flex flex-wrap gap-2.5 pt-2">
                {user.crops.map((cropName, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-50 border border-brand-100 text-brand-700"
                  >
                    🌾 {cropName}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-xs py-4 text-center">
                This farmer has not declared or searched crops in their portfolio yet.
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Account Activity Stats */}
        <div className="space-y-6">
          <Card title="Platform Engagement" description="Key performance indicators for this farmer.">
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 border rounded-lg p-4 text-center">
                <p className="text-2xl font-black text-brand-600">{user.plansGenerated}</p>
                <p className="text-xs text-slate-500 font-semibold uppercase mt-1">AI Crop Advisory Plans</p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Usage Details</h4>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Status Status:</span>
                  <Badge tone={user.status === "active" ? "green" : "red"}>
                    {user.status === "active" ? "Allowed" : "Suspended"}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Active Tier:</span>
                  <Badge tone={wallet?.plan === "pro" ? "purple" : wallet?.plan === "basic" ? "blue" : "slate"}>
                    {wallet?.plan?.toUpperCase() || "FREE"}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Chat Credits:</span>
                  <span className="font-bold text-slate-800">
                    {wallet ? wallet.chatCredits + (wallet.topupCredits || 0) : 0}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Scan Credits:</span>
                  <span className="font-bold text-slate-800">
                    {wallet ? wallet.imageCredits + (wallet.topupImageCredits || 0) : 0}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Activity Level:</span>
                  <span className="font-semibold text-slate-700">
                    {user.plansGenerated > 10 ? "Power Farmer" : user.plansGenerated > 0 ? "Active Grower" : "New Registrant"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
