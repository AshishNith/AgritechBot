export const formatNumber = (value: number): string => new Intl.NumberFormat("en-IN").format(value);

export const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

export const formatDateTime = (value: string): string =>
  new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });

export const toInputDate = (value?: string): string => (value ? new Date(value).toISOString().slice(0, 10) : "");

export const parseCsvText = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const stringifyCsv = (items: string[]): string => items.join(", ");

