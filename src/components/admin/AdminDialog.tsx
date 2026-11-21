"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  role?: "dialog" | "alertdialog";
};

export default function AdminDialog({ open, title, description, onClose, children, role = "dialog" }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      role={role}
      aria-labelledby={`${dialogId}-title`}
      aria-describedby={description ? `${dialogId}-description` : undefined}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50"
    >
      <div className="p-5 sm:p-6">
        <h2 id={`${dialogId}-title`} className="text-lg font-bold">{title}</h2>
        {description && <p id={`${dialogId}-description`} className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </dialog>
  );
}
