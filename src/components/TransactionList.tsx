"use client";

import { db } from "@/db/localDb";
import { formatRupiah } from "@/utils/currencyFormat";
import { useLiveQuery } from "dexie-react-hooks";
import { Trash2 } from "lucide-react";
import AppDialog from "./AppDialog";
import { useState } from "react";

export default function TransactionList() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // Narik data dari database dan ngurutin dari tanggal terbaru
  const transactions = useLiveQuery(async () => {
    const txs = await db.transactions
      .filter(t => !t.is_deleted)
      .reverse() // Balik urutan biar yang baru di atas
      .sortBy('date');

    // Ambil data kategori buat nyocokin ID dengan nama kategorinya
    const categories = await db.categories.toArray();
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    // Gabungin data transaksi dengan nama kategori
    return txs.map(t => ({
      ...t,
      categoryName: categoryMap.get(t.category_id) || "Kategori Dihapus"
    }));
  }, [], []);

  // Fungsi Soft Delete
  const handleDelete = async (id: string) => {
    setDeleteId(null);
    await db.transactions.update(id, { is_deleted: true, updated_at: Date.now() });
  };

  if (!transactions) {
    return <div className="p-8 text-center text-black font-bold">Memuat data...</div>;
  }
  
  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-2">
        <span className="text-4xl">📝</span>
        <p className="text-black font-bold mt-2">Belum ada riwayat transaksi.</p>
        <p className="text-gray-600 text-sm">Yuk, catat pengeluaran pertamamu!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 pb-24">
      {transactions.map((tx) => (
        <div key={tx.id} style={{ "--ticket-accent": tx.type === "INCOME" ? "#16a34a" : "#dc2626" } as React.CSSProperties} className="transaction-card finance-ticket flex justify-between items-center p-4 pl-5 bg-white border rounded-2xl">
          <div className="flex flex-col min-w-0 pr-3">
            {/* Nama Kategori */}
            <span className="font-bold text-black text-base truncate">{tx.categoryName}</span>
            
            {/* Tanggal yang diformat biar gampang dibaca */}
            <span className="transaction-date text-xs font-semibold text-gray-600">
              {new Date(tx.date).toLocaleDateString('id-ID', { 
                day: 'numeric', month: 'long', year: 'numeric' 
              })}
            </span>
            
            {/* Tampilkan catatan kalau ada */}
            {tx.note && (
              <span className="transaction-note text-sm font-medium text-black mt-1 bg-gray-100 p-1 rounded">
                &quot;{tx.note}&quot;
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Nominal dengan warna dinamis (Merah = Pengeluaran, Hijau = Pemasukan) */}
            <span className={`font-bold text-sm whitespace-nowrap ${tx.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
              {tx.type === "INCOME" ? "+" : "-"} Rp {formatRupiah(tx.amount)}
            </span>
            
            {/* Tombol Hapus */}
            <button 
              onClick={() => setDeleteId(tx.id)}
              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
              aria-label="Hapus transaksi"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      ))}
      <AppDialog
        isOpen={deleteId !== null}
        type="confirm"
        title="Hapus transaksi?"
        message="Transaksi ini akan disembunyikan dari riwayat dan laporanmu. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Ya, hapus"
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </div>
  );
}