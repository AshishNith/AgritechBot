import type { ReactNode } from "react";
import { Button } from "./Button";

interface Props {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}

export const Modal = ({ isOpen, title, children, onClose, footer }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto p-5 app-scrollbar">{children}</div>
        {footer && <footer className="border-t border-slate-200 px-5 py-4">{footer}</footer>}
      </div>
    </div>
  );
};

