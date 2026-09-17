"use client";

import { useState } from "react";
import { Layers, X } from "lucide-react";
import { createPortal } from "react-dom";
import { startTransition, useEffect } from "react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  type: "EXPENSE" | "INCOME";
}

export default function CategoryModal({ isOpen, onClose, onSave, type }: CategoryModalProps) {
  const [name, setName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => startTransition(() => setMounted(true)), []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
    setName(""); // Reset form setelah disave
  };

  return createPortal(
    // z-[100] dipake biar pop-up ini nutupin bottom navbar lu juga
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-100 px-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border border-[#dfe8e2]">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#dff3e8] text-[#146b55]"><Layers size={20} /></div>
            <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#146b55]">Kategori baru</p>
            <h3 className="text-lg font-bold text-black mt-1">
          Buat Kategori {type === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
            </h3></div>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="p-2 rounded-xl text-[#65736b] hover:bg-[#edf2ee]"><X size={18} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Beli Game, Nabung, dll..."
            className="p-3.5 bg-[#f4f8f5] border border-[#dfe8e2] rounded-xl outline-none focus:ring-2 focus:ring-[#9bd5bd] text-black font-medium"
            autoFocus
          />
          
          <div className="flex gap-3 justify-end mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 font-bold text-[#65736b] bg-[#edf2ee] rounded-xl hover:bg-[#dfe8e2] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 font-bold text-white bg-[#146b55] rounded-xl hover:bg-[#0d4e3e] transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}