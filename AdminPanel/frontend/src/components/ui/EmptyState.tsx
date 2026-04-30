interface Props {
  title: string;
  description?: string;
}

export const EmptyState = ({ title, description }: Props) => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
    <p className="text-sm font-medium text-slate-700">{title}</p>
    {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
  </div>
);

