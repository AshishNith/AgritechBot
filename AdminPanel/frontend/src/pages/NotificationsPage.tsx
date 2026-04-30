import { useState } from "react";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { TextareaField } from "../components/ui/TextareaField";
import { SelectField } from "../components/ui/SelectField";
import { Button } from "../components/ui/Button";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import { useSendNotification } from "../hooks/useNotifications";

export const NotificationsPage = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [crop, setCrop] = useState("");
  const [targetMode, setTargetMode] = useState<"broadcast" | "filter">("broadcast");
  const [formError, setFormError] = useState("");

  const sendNotification = useSendNotification();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFormError("Title and message are required.");
      return;
    }

    setFormError("");
    try {
      await sendNotification.mutateAsync({
        title: title.trim(),
        message: message.trim(),
        target: {
          broadcast: targetMode === "broadcast",
          location: targetMode === "filter" ? location || undefined : undefined,
          crop: targetMode === "filter" ? crop || undefined : undefined
        }
      });
    } catch {
      setFormError("Failed to send notification.");
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="Notifications"
        description="Send push notifications (mock/Firebase-ready) by broadcast, location, or crop."
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <InputField label="Notification Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <SelectField
              label="Target Mode"
              value={targetMode}
              onChange={(e) => setTargetMode(e.target.value as typeof targetMode)}
              options={[
                { label: "Broadcast", value: "broadcast" },
                { label: "Filter by location/crop", value: "filter" }
              ]}
            />
          </div>

          {targetMode === "filter" && (
            <div className="grid gap-3 md:grid-cols-2">
              <InputField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
              <InputField label="Crop" value={crop} onChange={(e) => setCrop(e.target.value)} />
            </div>
          )}

          <TextareaField
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
          />

          {formError && <ErrorState message={formError} />}
          {sendNotification.isError && <ErrorState message="Failed to send notification." />}

          <Button type="submit" isLoading={sendNotification.isPending}>
            Send Notification
          </Button>
        </form>
      </Card>

      <Card title="Dispatch Result">
        {!sendNotification.data ? (
          <EmptyState title="No dispatch yet" description="Send your first notification to see recipients." />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Sent to <span className="font-semibold">{sendNotification.data.sentCount}</span> active users.
            </p>
            <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Location</th>
                    <th className="px-3 py-2">User ID</th>
                  </tr>
                </thead>
                <tbody>
                  {sendNotification.data.recipients.map((recipient) => (
                    <tr key={recipient.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">{recipient.name}</td>
                      <td className="px-3 py-2">{recipient.location}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">{recipient.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

