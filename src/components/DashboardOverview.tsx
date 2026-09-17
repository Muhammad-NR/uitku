"use client";

import { db } from "@/db/localDb";
import { formatRupiah } from "@/utils/currencyFormat";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";

export default function DashboardOverview() {
  const transactions = useLiveQuery(() => 
    db.transactions.filter(t => !t.is_deleted).toArray()
  );

  if (!transactions) {
    return <div className="p-4 text-center font-bold text-black">Menghitung saldo...</div>;
  }

  // Hitung total pemasukan dan pengeluaran
  const totalIncome = transactions
    .filter(t => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  return (
    <div className="flex flex-col gap-4 p-5">
      {/* Kartu Total Saldo */}
      <div className="relative overflow-hidden bg-[#146b55] text-white rounded-[24px] p-6 shadow-[0_14px_30px_rgba(20,107,85,0.24)] flex flex-col gap-2 transition-transform hover:-translate-y-1 duration-300">
        <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full border-[18px] border-white/10" />
        <div className="absolute right-8 bottom-5 h-10 w-10 rounded-full bg-[#f0c879]/80" />
        <div className="flex items-center gap-2 opacity-90">
          <Wallet size={20} className="text-[#f0c879]" />
          <span className="text-sm font-semibold tracking-wide">Total Saldo Saat Ini</span>
        </div>
        <span className="text-4xl font-bold tracking-tight">
          Rp {formatRupiah(currentBalance)}
        </span>
      </div>

      {/* Grid Pemasukan & Pengeluaran */}
      <div className="grid grid-cols-2 gap-4">
        {/* Kartu Pemasukan */}
        <div className="bg-white border border-[#dfe8e2] rounded-2xl p-4 flex flex-col gap-1 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <ArrowUpCircle size={18} />
            <span className="text-xs font-bold text-[#17221d]">Pemasukan</span>
          </div>
          <span className="text-lg font-bold text-green-600">
            Rp {formatRupiah(totalIncome)}
          </span>
        </div>

        {/* Kartu Pengeluaran */}
        <div className="bg-white border border-[#dfe8e2] rounded-2xl p-4 flex flex-col gap-1 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <ArrowDownCircle size={18} />
            <span className="text-xs font-bold text-[#17221d]">Pengeluaran</span>
          </div>
          <span className="text-lg font-bold text-red-600">
            Rp {formatRupiah(totalExpense)}
          </span>
        </div>
      </div>
    </div>
  );
}