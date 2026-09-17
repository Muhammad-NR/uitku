import DashboardOverview from "@/components/DashboardOverview";
import TransactionList from "@/components/TransactionList";
import Link from "next/link";
import { Bell } from "lucide-react";

export default function Home() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Header Profile Singkat */}
      <div className="bg-[#f8fbf9]/95 backdrop-blur-md p-5 border-b border-[#dfe8e2] flex justify-between items-center sticky top-0 z-10">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#146b55] mb-1">Catatan Keuanganku</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#17221d]">Halo, Rizky!</h1>
          <p className="text-xs font-medium text-[#65736b] mt-1">Siap ngatur keuangan hari ini?</p>
        </div>
        <button aria-label="Notifikasi" className="p-3 bg-white border border-[#dfe8e2] rounded-2xl hover:bg-[#dff3e8] hover:-translate-y-0.5 active:scale-95 transition-all shadow-sm">
          <Bell size={20} className="text-black" />
        </button>
      </div>

      {/* Ringkasan Saldo */}
      <DashboardOverview />

      {/* Riwayat Singkat */}
      <div className="px-5 mt-5 mb-2 flex justify-between items-center">
        <h2 className="text-lg font-bold tracking-tight text-[#17221d]">Transaksi Terakhir</h2>
        <Link href="/history" className="text-xs font-bold text-[#146b55] hover:translate-x-0.5 transition-transform">
          Lihat Semua
        </Link>
      </div>
      
      {/* Kita manfaatin komponen TransactionList yang udah lu bikin sebelumnya */}
      <div className="home-transaction-preview h-64 overflow-hidden relative">
        <TransactionList />
        <div className="home-list-fade absolute bottom-0 left-0 right-0 h-16 z-10 pointer-events-none"></div>
      </div>
    </div>
  );
}