"use client";

import { db } from "@/db/localDb";
import { useLiveQuery } from "dexie-react-hooks";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatRupiah } from "@/utils/currencyFormat";

// Pilihan warna biar tiap kategori beda warna
const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#9333ea', '#0891b2', '#ea580c'];

export default function ExpenseChart() {
  const data = useLiveQuery(async () => {
    // Ambil SEMUA pengeluaran yang belum dihapus
    const txs = await db.transactions.filter(t => t.type === 'EXPENSE' && !t.is_deleted).toArray();
    const categories = await db.categories.toArray();
    
    // Bikin mapping ID kategori ke Nama kategori
    const catMap = new Map(categories.map(c => [c.id, c.name]));

    // Kelompokkan total pengeluaran per kategori
    const grouped = txs.reduce((acc, curr) => {
      const catName = catMap.get(curr.category_id) || 'Lainnya';
      acc[catName] = (acc[catName] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    // Ubah formatnya biar bisa dibaca sama Recharts
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  });

  if (!data) return <div className="text-center p-4 font-bold text-black">Memuat grafik...</div>;
  
  if (data.length === 0) {
    return (
      <div className="text-center p-8 font-bold text-black border-2 border-dashed border-gray-300 rounded-xl">
        Belum ada data pengeluaran buat dibikin grafik nih.
      </div>
    );
  }

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={data} 
            dataKey="value" 
            nameKey="name" 
            cx="50%" 
            cy="50%" 
            innerRadius={60}
            outerRadius={90} 
            paddingAngle={5}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => `Rp ${formatRupiah(Number(value) || 0)}`}
            contentStyle={{ borderRadius: '8px', fontWeight: 'bold', color: 'black' }}
          />
          <Legend wrapperStyle={{ fontWeight: 'bold', color: 'black' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}