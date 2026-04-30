import { useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { Button } from "../components/ui/Button";
import { DataTable, type Column } from "../components/ui/DataTable";
import { Modal } from "../components/ui/Modal";
import { TextareaField } from "../components/ui/TextareaField";
import { Loader } from "../components/ui/Loader";
import { ErrorState } from "../components/ui/ErrorState";
import { Pagination } from "../components/ui/Pagination";
import { useCropMutations, useCrops } from "../hooks/useCrops";
import type { CropItem, CropPayload } from "../types/api";
import { formatDateTime, parseCsvText, stringifyCsv } from "../utils/format";

const PAGE_SIZE = 10;

const initialPayload: CropPayload = {
  name: "",
  soilType: "",
  climate: "",
  growthStages: [],
  schedule: []
};

export const CropsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropItem | null>(null);
  const [form, setForm] = useState(initialPayload);
  const [growthStagesText, setGrowthStagesText] = useState("");
  const [scheduleText, setScheduleText] = useState("");
  const [formError, setFormError] = useState("");

  const cropsQuery = useCrops({ page, limit: PAGE_SIZE, search: search || undefined });
  const { create, update, remove } = useCropMutations();

  const openCreateModal = () => {
    setEditingCrop(null);
    setForm(initialPayload);
    setGrowthStagesText("");
    setScheduleText("");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (crop: CropItem) => {
    setEditingCrop(crop);
    setForm({
      name: crop.name,
      soilType: crop.soilType,
      climate: crop.climate,
      growthStages: crop.growthStages,
      schedule: crop.schedule
    });
    setGrowthStagesText(stringifyCsv(crop.growthStages));
    setScheduleText(stringifyCsv(crop.schedule));
    setFormError("");
    setIsModalOpen(true);
  };

  const onSave = async () => {
    const payload: CropPayload = {
      ...form,
      growthStages: parseCsvText(growthStagesText),
      schedule: parseCsvText(scheduleText)
    };

    if (!payload.name.trim() || !payload.soilType.trim() || !payload.climate.trim()) {
      setFormError("Crop name, soil type, and climate are required.");
      return;
    }

    setFormError("");

    try {
      if (editingCrop) {
        await update.mutateAsync({ cropId: editingCrop.id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch {
      setFormError('Failed to save crop. Please retry.');
    }
  };

  const columns: Array<Column<CropItem>> = useMemo(
    () => [
      {
        key: "name",
        header: "Crop",
        cell: (crop) => (
          <div>
            <p className="font-medium text-slate-900">{crop.name}</p>
            <p className="text-xs text-slate-500">Created: {formatDateTime(crop.createdAt)}</p>
          </div>
        )
      },
      {
        key: "soilType",
        header: "Soil Type",
        cell: (crop) => crop.soilType
      },
      {
        key: "climate",
        header: "Climate",
        cell: (crop) => crop.climate
      },
      {
        key: "stages",
        header: "Growth Stages",
        cell: (crop) => crop.growthStages.join(", ") || "-"
      },
      {
        key: "schedule",
        header: "Fertilizer Schedule",
        cell: (crop) => crop.schedule.join(", ") || "-"
      },
      {
        key: "actions",
        header: "Actions",
        cell: (crop) => (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => openEditModal(crop)}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => remove.mutate(crop.id)} isLoading={remove.isPending}>
              Delete
            </Button>
          </div>
        )
      }
    ],
    [remove]
  );

  return (
    <div className="space-y-6">
      <Card title="Crop Management" description="Manage crop metadata used by AI plans.">
        <div className="flex flex-col gap-3 md:flex-row">
          <InputField
            label="Search Crop"
            placeholder="Name, soil type, climate"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="flex items-end">
            <Button variant="secondary" onClick={() => setPage(1)}>
              Apply
            </Button>
          </div>
          <div className="flex items-end">
            <Button onClick={openCreateModal}>Add Crop</Button>
          </div>
        </div>
      </Card>

      <Card>
        {(remove.isError || create.isError || update.isError) && (
          <div className="mb-4">
            <ErrorState message="Crop action failed. Please retry." />
          </div>
        )}
        {cropsQuery.isLoading && <Loader />}
        {cropsQuery.isError && <ErrorState message="Unable to fetch crops." />}
        {cropsQuery.data && (
          <>
            <DataTable columns={columns} data={cropsQuery.data.items} emptyTitle="No crops found." />
            <Pagination
              page={cropsQuery.data.pagination.page}
              totalPages={cropsQuery.data.pagination.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        title={editingCrop ? "Edit Crop" : "Add Crop"}
        onClose={() => setIsModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSave} isLoading={create.isPending || update.isPending}>
              Save
            </Button>
          </div>
        }
      >
        <div className="grid gap-3">
          <InputField
            label="Crop Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <InputField
            label="Soil Type"
            value={form.soilType}
            onChange={(event) => setForm((prev) => ({ ...prev, soilType: event.target.value }))}
            required
          />
          <InputField
            label="Climate"
            value={form.climate}
            onChange={(event) => setForm((prev) => ({ ...prev, climate: event.target.value }))}
            required
          />
          <TextareaField
            label="Growth Stages (comma-separated)"
            value={growthStagesText}
            onChange={(event) => setGrowthStagesText(event.target.value)}
            rows={3}
          />
          <TextareaField
            label="Fertilizer Schedule (comma-separated)"
            value={scheduleText}
            onChange={(event) => setScheduleText(event.target.value)}
            rows={3}
          />
          {formError && <ErrorState message={formError} />}
        </div>
      </Modal>
    </div>
  );
};

