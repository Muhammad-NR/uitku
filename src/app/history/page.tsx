import TransactionList from "@/components/TransactionList";

export default function History() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Header Halaman */}
      <div className="bg-white p-4 border-b border-gray-300 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-black">Riwayat Transaksi</h1>
      </div>
      
      {/* Daftar Transaksinya */}
      <TransactionList />
    </div>
  );
}