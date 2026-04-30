import { Button } from "./Button";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
}

export const Pagination = ({ page, totalPages, onPageChange }: Props) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      <Button variant="secondary" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Previous
      </Button>
      <span className="text-sm text-slate-600">
        Page {page} of {totalPages}
      </span>
      <Button variant="secondary" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Next
      </Button>
    </div>
  );
};

