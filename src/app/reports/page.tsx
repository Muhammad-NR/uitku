"use client";

import { db } from "@/db/localDb";
import { ArrowDownToLine, ArrowUpFromLine, Download, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import { useLiveQuery } from "dexie-react-hooks";
import { formatRupiah } from "@/utils/currencyFormat";
import AppDialog from "@/components/AppDialog";
import { useState } from "react";

// IMPORT DINAMIS: Matikan SSR (Server-Side Rendering) khusus buat komponen ini
const ExpenseChart = dynamic(() => import("@/components/ExpenseChart"), { 
  ssr: false,
  loading: () => <div className="text-center p-8 font-bold text-gray-500 animate-pulse">Menyiapkan grafik...</div>
});

const FinancialTrendChart = dynamic(() => import("@/components/FinancialTrendChart"), {
  ssr: false,
  loading: () => <div className="text-center p-8 font-bold text-gray-500 animate-pulse">Menyiapkan tren...</div>
});

export default function Reports() {
  const [exportError, setExportError] = useState(false);
  const totals = useLiveQuery(async () => {
    const transactions = await db.transactions.filter((transaction) => !transaction.is_deleted).toArray();
    return transactions.reduce((result, transaction) => {
      result[transaction.type === "INCOME" ? "income" : "expense"] += transaction.amount;
      return result;
    }, { income: 0, expense: 0 });
  });

  const handleExportCSV = async () => {
    try {
      const txs = await db.transactions.filter(t => !t.is_deleted).sortBy('date');
      const categories = await db.categories.toArray();
      const catMap = new Map(categories.map(c => [c.id, c.name]));

      let csvContent = "Tanggal,Tipe,Kategori,Nominal,Catatan\n";
      
      txs.forEach(t => {
        const date = new Date(t.date).toLocaleDateString('id-ID');
        const type = t.type === "INCOME" ? "Pemasukan" : "Pengeluaran";
        const cat = catMap.get(t.category_id) || "Lainnya";
        const amount = t.amount;
        const note = t.note || "-";
        
        csvContent += `${date},${type},${cat},${amount},"${note}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Laporan_Keuanganku_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Gagal export:", error);
      setExportError(true);
    }
  };

  return (
    <div className="animate-in fade-in duration-300 pb-24 text-black">
      <div className="bg-[#f8fbf9]/95 backdrop-blur-md p-5 border-b border-[#dfe8e2] sticky top-0 z-10 flex justify-between items-center">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#146b55] mb-1">Insight keuangan</p><h1 className="text-2xl font-bold tracking-tight">Laporan</h1></div>
        
        <button 
          onClick={handleExportCSV} 
          className="flex items-center gap-2 bg-[#146b55] text-white px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-[#0d4e3e] active:scale-95 transition-all shadow-sm"
        >
          <Download size={16} /> 
          CSV
        </button>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl border border-[#dfe8e2] bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-green-600 mb-2"><ArrowUpFromLine size={17} /><span className="text-xs font-bold text-[#17221d]">Pemasukan</span></div><p className="text-lg font-bold text-green-600">Rp {formatRupiah(totals?.income || 0)}</p></div>
          <div className="rounded-2xl border border-[#dfe8e2] bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-red-600 mb-2"><ArrowDownToLine size={17} /><span className="text-xs font-bold text-[#17221d]">Pengeluaran</span></div><p className="text-lg font-bold text-red-600">Rp {formatRupiah(totals?.expense || 0)}</p></div>
        </div>
        <h2 className="flex items-center gap-2 font-bold text-lg mb-2"><TrendingUp size={20} className="text-[#146b55]" /> Arus Kas</h2>
        <p className="text-xs font-semibold text-gray-500 mb-4">Bandingkan pemasukan dan pengeluaran berdasarkan tanggal.</p>
        <div className="bg-white border border-[#dfe8e2] pt-4 pb-5 px-3 rounded-2xl shadow-sm mb-6">
          <FinancialTrendChart />
        </div>
        <h2 className="font-bold text-lg mb-2">Distribusi Pengeluaran</h2>
        <p className="text-xs font-semibold text-gray-500 mb-4">
          Cek duit lu paling banyak habis buat apa.
        </p>

        <div className="bg-white border border-[#dfe8e2] pt-2 pb-6 px-4 rounded-2xl shadow-sm">
          {/* Grafiknya dipanggil di sini */}
          <ExpenseChart />
        </div>
      </div>
      <AppDialog isOpen={exportError} type="error" title="Export belum berhasil" message="Data CSV belum bisa dibuat. Silakan coba lagi." onClose={() => setExportError(false)} />
    </div>
  );
}