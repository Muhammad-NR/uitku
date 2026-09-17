"use client";

import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { createPortal } from "react-dom";
import { startTransition, useEffect, useState } from "react";

interface AppDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "confirm" | "success" | "error" | "info";
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onClose: () => void;
}

const dialogStyles = {
  confirm: { icon: AlertTriangle, iconClass: "bg-[#fff3d8] text-[#b77b12]", buttonClass: "bg-[#dc2626] hover:bg-[#b91c1c]" },
  success: { icon: CheckCircle2, iconClass: "bg-[#dff3e8] text-[#146b55]", buttonClass: "bg-[#146b55] hover:bg-[#0d4e3e]" },
  error: { icon: AlertTriangle, iconClass: "bg-[#ffe4e4] text-[#dc2626]", buttonClass: "bg-[#dc2626] hover:bg-[#b91c1c]" },
  info: { icon: Info, iconClass: "bg-[#e3efff] text-[#2563eb]", buttonClass: "bg-[#146b55] hover:bg-[#0d4e3e]" },
};

export default function AppDialog({ isOpen, title, message, type = "info", confirmLabel = "Mengerti", cancelLabel = "Batal", onConfirm, onClose }: AppDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;
  const style = dialogStyles[type];
  const Icon = style.icon;

  return createPortal(
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-[#07140f]/60 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="app-dialog-title" className="app-dialog max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-[28px] border border-[#dfe8e2] bg-white p-6 shadow-[0_24px_60px_rgba(20,54,39,0.24)]">
        <div className="flex items-start justify-between">
          <div className={`rounded-2xl p-3 ${style.iconClass}`}><Icon size={23} /></div>
          <button type="button" onClick={onClose} aria-label="Tutup dialog" className="rounded-xl p-2 text-[#65736b] transition-colors hover:bg-[#edf2ee]"><X size={18} /></button>
        </div>
        <h2 id="app-dialog-title" className="mt-5 text-xl font-bold tracking-tight text-[#17221d]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[#65736b]">{message}</p>
        <div className={`mt-6 grid gap-3 ${onConfirm ? "grid-cols-2" : "grid-cols-1"}`}>
          {onConfirm && <button type="button" onClick={onClose} className="rounded-2xl bg-[#edf2ee] px-4 py-3.5 text-sm font-bold text-[#65736b] transition-colors hover:bg-[#dfe8e2]">{cancelLabel}</button>}
          <button type="button" onClick={onConfirm || onClose} className={`rounded-2xl px-4 py-3.5 text-sm font-bold text-white transition-colors ${style.buttonClass}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
