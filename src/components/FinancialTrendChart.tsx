"use client";

import { db } from "@/db/localDb";
import { useLiveQuery } from "dexie-react-hooks";
import { CartesianGrid, Legend, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";
import { formatRupiah } from "@/utils/currencyFormat";

interface TrendPoint {
  date: string;
  label: string;
  income: number;
  expense: number;
}

type Period = "year" | "month" | "day";

const formatAxisValue = (value: number) => {
  if (value >= 1000000) return `${Math.round(value / 1000000)} jt`;
  if (value >= 1000) return `${Math.round(value / 1000)} rb`;
  return String(value);
};

export default function FinancialTrendChart() {
  const [period, setPeriod] = useState<Period>("year");
  const data = useLiveQuery(async (): Promise<TrendPoint[]> => {
    const transactions = await db.transactions
      .filter((transaction) => !transaction.is_deleted)
      .toArray();

    const grouped = new Map<string, TrendPoint>();
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const date = transactionDate.toISOString().slice(0, 10);
      const key = period === "year" ? `${transactionDate.getFullYear()}-${transactionDate.getMonth()}` : period === "month" ? date.slice(0, 7) : date;
      const point = grouped.get(key) || {
        date: key,
        label: period === "year"
          ? transactionDate.toLocaleDateString("id-ID", { month: "short" })
          : transactionDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        income: 0,
        expense: 0,
      };

      if (transaction.type === "INCOME") point.income += transaction.amount;
      else point.expense += transaction.amount;
      grouped.set(key, point);
    });

    return [...grouped.values()].sort((first, second) => first.date.localeCompare(second.date));
  }, [period]);

  if (!data) return <div className="p-8 text-center text-sm font-semibold text-[#65736b] animate-pulse">Menyiapkan tren keuangan...</div>;

  if (data.length === 0) {
    return <div className="rounded-2xl border-2 border-dashed border-[#dfe8e2] p-8 text-center text-sm font-semibold text-[#65736b]">Belum ada transaksi untuk menampilkan tren.</div>;
  }

  const periods: { label: string; value: Period }[] = [
    { label: "Tahunan", value: "year" },
    { label: "Bulanan", value: "month" },
    { label: "Tanggal", value: "day" },
  ];

  return (
    <div className="w-full">
      <div className="mb-5 grid grid-cols-3 gap-1 rounded-xl bg-[#edf2ee] p-1">
        {periods.map((item) => (
          <button key={item.value} type="button" onClick={() => setPeriod(item.value)} className={`rounded-lg py-2 text-xs font-bold transition-all ${period === item.value ? "bg-[#146b55] text-white shadow-sm" : "text-[#829188] hover:text-[#146b55]"}`}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 4 }} barGap={3}>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#dfe8e2" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#829188", fontSize: 11, fontWeight: 600 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#829188", fontSize: 10 }} tickFormatter={formatAxisValue} />
          <Tooltip
            contentStyle={{ borderRadius: "14px", border: "1px solid #dfe8e2", fontWeight: 700, color: "#17221d" }}
            formatter={(value, name) => [`Rp ${formatRupiah(Number(value))}`, name === "income" ? "Pemasukan" : "Pengeluaran"]}
          />
          <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 700 }} formatter={(value) => value === "income" ? "Pemasukan" : "Pengeluaran"} />
          <Bar dataKey="income" name="income" fill="#16a34a" radius={[6, 6, 0, 0]} maxBarSize={18} />
          <Bar dataKey="expense" name="expense" fill="#dc2626" radius={[6, 6, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
